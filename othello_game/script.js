class OthelloGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'black'; // 'black' 또는 'white'
        this.gameOver = false;
        this.passCount = 0;
        this.directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        // AI 설정
        const sideSelect = document.getElementById('ai-side');
        const levelSelect = document.getElementById('ai-level');
        this.aiSide = sideSelect ? sideSelect.value : 'none'; // 'none' | 'black' | 'white'
        this.aiLevel = levelSelect ? levelSelect.value : 'easy'; // 'easy' | 'normal' | 'hard'
        this.isAITurnInProgress = false;
        this.aiTimeoutId = null;
        this.passTimeoutId = null;

        // 이력/되돌리기(최대 3수)
        this.moveHistory = [];
        this.historyStack = [];
        this.maxUndo = 3;
        
        this.initializeBoard();
        this.setupEventListeners();
        this.updateDisplay();
        this.findValidMoves();

        // 멀티플레이어 초기화
        this.initMultiplayer();
    }
    
    initializeBoard() {
        // 8x8 보드 초기화
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        
        // 초기 돌 배치 (중앙 4칸)
        this.board[3][3] = 'white';
        this.board[3][4] = 'black';
        this.board[4][3] = 'black';
        this.board[4][4] = 'white';
        
        this.renderBoard();
        this.lastMove = null; // 마지막 수 위치 저장 [row, col]
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col]) {
                    const stone = document.createElement('div');
                    stone.className = `stone ${this.board[row][col]}`;
                    cell.appendChild(stone);
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                cell.addEventListener('mouseenter', () => this.handleCellHover(row, col, true));
                cell.addEventListener('mouseleave', () => this.handleCellHover(row, col, false));
                gameBoard.appendChild(cell);
            }
        }

        // 마지막 수 하이라이트
        if (this.lastMove) {
            const [lr, lc] = this.lastMove;
            const lastCell = document.querySelector(`[data-row="${lr}"][data-col="${lc}"]`);
            if (lastCell) lastCell.classList.add('last-move');
        }

        // 힌트 마커 제거 (상태와 동기화 위해 렌더마다 정리)
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('hint'));
    }

    // ===== 멀티플레이어 =====
    initMultiplayer() {
        this.ws = (window.MULTI && window.MULTI.enabled) ? window.MULTI.ws : null;
        this.clientId = null;
        this.roomId = null;
        this.role = 'spectator';
        this.opponentPresent = false;
        this.syncLock = false; // 수신 중 로컬 입력 방지 플래그

        if (!this.ws) return;

        this.ws.addEventListener('open', () => {
            // 기본 룸 조인. 추후 UI로 roomId/name/mode 선택 가능
            this.joinRoom('default', `User-${Math.floor(Math.random()*1000)}`, 'player');
        });
        this.ws.addEventListener('message', (ev) => {
            let msg; try { msg = JSON.parse(ev.data); } catch { return; }
            const t = msg.type;
            if (t === 'joined') {
                this.clientId = msg.clientId;
                this.roomId = msg.roomId;
                this.role = msg.role;
                this.updatePresence(msg.players, msg.spectators);
                return;
            }
            if (t === 'presence') {
                this.updatePresence(msg.players, msg.spectators);
                return;
            }
            if (t === 'ready') {
                const status = document.getElementById('game-status');
                if (status) status.textContent = '상대가 입장했습니다. 게임 시작!';
                return;
            }
            if (t === 'opponent_left') {
                const status = document.getElementById('game-status');
                if (status) status.textContent = '상대가 연결을 종료했습니다. 대기 중...';
                this.opponentPresent = false;
                return;
            }
            // 실시간 상태 동기화
            if (t === 'state' && msg.senderId !== this.clientId) {
                this.syncLock = true;
                this.restoreState(msg.payload);
                this.syncLock = false;
                return;
            }
            // 단일 액션 동기화 (move/pass/new_game)
            if (t === 'move' && msg.senderId !== this.clientId) {
                this.makeMove(msg.row, msg.col);
                return;
            }
            if (t === 'pass' && msg.senderId !== this.clientId) {
                this.passTurn();
                return;
            }
            if (t === 'new_game' && msg.senderId !== this.clientId) {
                this.newGame();
                return;
            }
        });
        this.ws.addEventListener('close', () => {
            const status = document.getElementById('game-status');
            if (status) status.textContent = '서버와의 연결이 종료되었습니다.';
        });
    }

    joinRoom(roomId, name, mode) {
        if (!this.ws) return;
        this.ws.send(JSON.stringify({ type: 'join', roomId, name, mode }));
    }

    updatePresence(players, spectators) {
        const status = document.getElementById('game-status');
        const numPlayers = players.length;
        this.opponentPresent = numPlayers >= 2;
        if (!this.opponentPresent) {
            if (status) status.textContent = '상대 대기 중... (룸에 입장하면 자동 시작)';
        }
    }

    sendAction(type, payload = {}) {
        if (!this.ws || !window.MULTI.enabled) return;
        this.ws.send(JSON.stringify({ type, ...payload }));
    }
    
    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('pass-btn').addEventListener('click', () => {
            this.passTurn();
        });

        const sideSelect = document.getElementById('ai-side');
        const levelSelect = document.getElementById('ai-level');
        const startSelect = document.getElementById('start-player');
        if (sideSelect) {
            sideSelect.addEventListener('change', () => {
                this.aiSide = sideSelect.value;
                // 기존 대기 취소
                if (this.aiTimeoutId) {
                    clearTimeout(this.aiTimeoutId);
                    this.aiTimeoutId = null;
                    this.isAITurnInProgress = false;
                }
                // AI 턴이면 즉시 스케줄
                this.scheduleAIMoveOnce();
            });
        }
        if (levelSelect) {
            levelSelect.addEventListener('change', () => {
                this.aiLevel = levelSelect.value;
                // 기존 대기 취소 후 재스케줄
                if (this.aiTimeoutId) {
                    clearTimeout(this.aiTimeoutId);
                    this.aiTimeoutId = null;
                    this.isAITurnInProgress = false;
                }
                this.scheduleAIMoveOnce();
            });
        }
        if (startSelect) {
            startSelect.addEventListener('change', () => {
                // 시작 플레이어 변경은 새 게임 시 반영됨
            });
        }

        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) hintBtn.addEventListener('click', () => this.showHint());
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
    }
    
    handleCellClick(row, col) {
        // AI 차례거나 AI가 생각 중이면 클릭 무시
        if (this.gameOver || this.board[row][col] !== null || this.currentPlayer === this.aiSide || this.isAITurnInProgress || this.syncLock) {
            return;
        }
        
        if (this.isValidMove(row, col, this.currentPlayer)) {
            this.makeMove(row, col);
            // 멀티 전송
            this.sendAction('move', { row, col });
        }
    }
    
    isValidMove(row, col, player) {
        // 현재 보드에서 주어진 수가 유효한지 체크
        const flips = this.getFlipsForMove(this.board, row, col, player);
        return flips.length > 0;
    }

    getOpponent(player) {
        return player === 'black' ? 'white' : 'black';
    }

    getFlipsForMove(board, row, col, player) {
        if (!this.isValidPosition(row, col) || board[row][col] !== null) {
            return [];
        }
        const opponent = this.getOpponent(player);
        const toFlip = [];
        for (const [dx, dy] of this.directions) {
            let x = row + dx;
            let y = col + dy;
            const line = [];
            while (this.isValidPosition(x, y) && board[x][y] === opponent) {
                line.push([x, y]);
                x += dx;
                y += dy;
            }
            if (line.length > 0 && this.isValidPosition(x, y) && board[x][y] === player) {
                toFlip.push(...line);
            }
        }
        return toFlip;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    makeMove(row, col) {
        // 스냅샷 저장 (되돌리기)
        this.pushSnapshot();
        this.board[row][col] = this.currentPlayer;
        // 배치 애니메이션 + 사운드
        const placedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (placedCell) {
            const stone = document.createElement('div');
            stone.className = `stone ${this.currentPlayer} placed`;
            placedCell.innerHTML = '';
            placedCell.appendChild(stone);
        }
        this.playSfx('place');

        this.flipStones(row, col);
        this.passCount = 0;
        this.lastMove = [row, col];
        
        // 히스토리 기록
        this.addHistoryEntry({ type: 'move', player: this.currentPlayer, row, col });

        // 턴 변경
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';

        // 애니메이션이 보이도록 약간 지연 후 리렌더/로직 진행
        setTimeout(() => {
            this.renderBoard();
            this.updateDisplay();
            
            // 다음 플레이어의 유효한 수 찾기
            const validMoves = this.findValidMoves();
            
            if (validMoves.length === 0) {
                if (this.passCount === 0) {
                    this.passTurn();
                } else {
                    this.endGame();
                }
            }
        }, 360);
    }
    
    flipStones(row, col) {
        const player = this.board[row][col];
        const opponent = player === 'black' ? 'white' : 'black';
        
        for (const [dx, dy] of this.directions) {
            let x = row + dx;
            let y = col + dy;
            const stonesToFlip = [];
            
            // 상대방 돌을 따라가며 뒤집을 돌들 수집
            while (this.isValidPosition(x, y) && this.board[x][y] === opponent) {
                stonesToFlip.push([x, y]);
                x += dx;
                y += dy;
            }
            
            // 자신의 돌로 끝나면 수집한 돌들을 뒤집기
            if (this.isValidPosition(x, y) && this.board[x][y] === player) {
                for (const [flipRow, flipCol] of stonesToFlip) {
                    this.board[flipRow][flipCol] = player;
                    // 화면에 있다면 플립 애니메이션
                    const flipCell = document.querySelector(`[data-row="${flipRow}"][data-col="${flipCol}"]`);
                    if (flipCell) {
                        const stone = flipCell.querySelector('.stone');
                        if (stone) {
                            stone.classList.add('flip');
                            // 색상 업데이트를 애니메이션 후에 반영하기 위해 약간 지연
                            setTimeout(() => {
                                stone.classList.remove('black', 'white');
                                stone.classList.add(player);
                            }, 300);
                        }
                    }
                }
                // 한번이라도 뒤집혔다면 효과음 재생
                if (stonesToFlip.length > 0) this.playSfx('flip');
            }
        }
    }

    handleCellHover(row, col, isEnter) {
        if (!isEnter) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!cell) return;
            const prev = cell.querySelector('.stone.preview');
            if (prev) prev.remove();
            return;
        }
        if (this.gameOver || this.board[row][col] !== null) return;
        if (this.currentPlayer === this.aiSide || this.isAITurnInProgress) return;
        if (!this.isValidMove(row, col, this.currentPlayer)) return;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;
        const prev = cell.querySelector('.stone');
        if (prev) return; // 이미 돌이 있는 칸
        const preview = document.createElement('div');
        preview.className = `stone ${this.currentPlayer} preview`;
        cell.appendChild(preview);
    }

    playSfx(type) {
        const id = type === 'flip' ? 'sfx-flip' : 'sfx-place';
        const el = document.getElementById(id);
        if (!el) return;
        // 같은 소리 연속 재생을 위해 currentTime 초기화
        try {
            el.currentTime = 0;
        } catch (_) {}
        el.play().catch(() => {});
    }
    
    findValidMoves() {
        const validMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col, this.currentPlayer)) {
                    validMoves.push([row, col]);
                }
            }
        }
        
        // 유효한 수 강조 표시
        this.highlightValidMoves(validMoves);
        
        return validMoves;
    }
    
    highlightValidMoves(validMoves) {
        // 모든 셀에서 valid-move 클래스 제거
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('valid-move');
            cell.classList.remove('hint');
        });
        
        // 유효한 수에 valid-move 클래스 추가
        validMoves.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('valid-move');
            }
        });
    }
    
    passTurn() {
        // 스냅샷 저장
        this.pushSnapshot();
        // 기록
        this.addHistoryEntry({ type: 'pass', player: this.currentPlayer });
        this.passCount++;
        const passedPlayer = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        // 통지
        const msg = `${passedPlayer === 'black' ? '흑' : '백'} 착수 불가. 패스합니다.`;
        const status = document.getElementById('game-status');
        if (status) status.textContent = msg;
        this.updateDisplay();
        // 멀티 전송
        this.sendAction('pass', {});
        
        const validMoves = this.findValidMoves();
        if (validMoves.length === 0) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameOver = true;
        const blackCount = this.countStones('black');
        const whiteCount = this.countStones('white');
        
        let message = '';
        let statusClass = '';
        
        if (blackCount > whiteCount) {
            message = `게임 종료! 흑돌 승리 (${blackCount}:${whiteCount})`;
            statusClass = 'win';
        } else if (whiteCount > blackCount) {
            message = `게임 종료! 백돌 승리 (${whiteCount}:${blackCount})`;
            statusClass = 'lose';
        } else {
            message = `게임 종료! 무승부 (${blackCount}:${whiteCount})`;
            statusClass = 'draw';
        }
        
        document.getElementById('game-status').textContent = message;
        document.getElementById('game-status').className = `game-status ${statusClass}`;
        // 승리 애니메이션 바디 클래스 토글
        document.body.classList.add('victory');
        document.getElementById('pass-btn').disabled = true;
    }
    
    countStones(color) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === color) {
                    count++;
                }
            }
        }
        return count;
    }
    
    updateDisplay() {
        // 현재 턴 표시
        const currentPlayerText = this.currentPlayer === 'black' ? '흑돌' : '백돌';
        document.getElementById('current-player').textContent = currentPlayerText;
        
        // 점수 업데이트
        const blackScore = this.countStones('black');
        const whiteScore = this.countStones('white');
        document.getElementById('black-score').textContent = blackScore;
        document.getElementById('white-score').textContent = whiteScore;
        
        // 패스 버튼 활성화/비활성화
        const passBtn = document.getElementById('pass-btn');
        if (this.gameOver) {
            passBtn.disabled = true;
        } else {
            const validMoves = this.findValidMoves();
            // AI 차례에는 사용자가 패스 못 하도록 비활성화
            passBtn.disabled = validMoves.length > 0 || this.currentPlayer === this.aiSide;
            // 자동 패스 안내 및 예약
            if (validMoves.length === 0 && !this.passTimeoutId && !this.isAITurnInProgress) {
                const who = this.currentPlayer === 'black' ? '흑' : '백';
                const status = document.getElementById('game-status');
                if (status) status.textContent = `${who} 착수 불가. 1초 후 패스합니다.`;
                this.passTimeoutId = setTimeout(() => {
                    this.passTimeoutId = null;
                    if (!this.gameOver) this.passTurn();
                }, 1000);
            }
        }

        // AI 차례면 스케줄
        this.scheduleAIMoveOnce();
        // 되돌리기 버튼 상태
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = this.historyStack.length === 0 || this.isAITurnInProgress;
        // 이력 렌더
        this.updateHistoryList();
    }
    
    newGame() {
        this.board = [];
        const startSelect = document.getElementById('start-player');
        const startValue = startSelect ? startSelect.value : 'black';
        this.currentPlayer = startValue === 'white' ? 'white' : 'black';
        this.gameOver = false;
        this.passCount = 0;
        this.lastMove = null;
        this.moveHistory = [];
        this.historyStack = [];
        
        document.getElementById('game-status').textContent = '';
        document.getElementById('game-status').className = 'game-status';
        document.body.classList.remove('victory');
        document.getElementById('pass-btn').disabled = false;

        // 타이머 초기화
        if (this.aiTimeoutId) { clearTimeout(this.aiTimeoutId); this.aiTimeoutId = null; }
        if (this.passTimeoutId) { clearTimeout(this.passTimeoutId); this.passTimeoutId = null; }
        this.isAITurnInProgress = false;
        
        // 최신 UI 설정 반영
        const sideSelect = document.getElementById('ai-side');
        const levelSelect = document.getElementById('ai-level');
        if (sideSelect) this.aiSide = sideSelect.value;
        if (levelSelect) this.aiLevel = levelSelect.value;

        this.initializeBoard();
        this.updateDisplay();
        this.findValidMoves();
        // 멀티 전송
        this.sendAction('new_game', {});
        // 시작이 AI라면 즉시 스케줄
        this.scheduleAIMoveOnce();
    }

    // ----- AI 관련 메서드 -----
    scheduleAIMoveOnce() {
        if (this.gameOver) return;
        if (this.aiSide === 'none') return;
        if (this.currentPlayer !== this.aiSide) return;
        if (this.isAITurnInProgress) return;
        if (this.aiTimeoutId) return; // 이미 대기 중

        this.isAITurnInProgress = true;
        this.aiTimeoutId = setTimeout(() => {
            this.aiTimeoutId = null;
            // 게임 중간에 종료되었을 수도 있음
            if (this.gameOver || this.currentPlayer !== this.aiSide) {
                this.isAITurnInProgress = false;
                return;
            }
            const moves = this.getValidMoves(this.board, this.currentPlayer);
            if (moves.length === 0) {
                this.passTurn();
                this.isAITurnInProgress = false;
                return;
            }
            const [row, col] = this.chooseAIMove(this.board, this.currentPlayer, this.aiLevel);
            if (row != null && col != null) {
                this.makeMove(row, col);
            }
            this.isAITurnInProgress = false;
        }, 1000);
    }

    // ----- 힌트 & 이력 & 되돌리기 -----
    showHint() {
        if (this.gameOver || this.currentPlayer === this.aiSide || this.isAITurnInProgress) return;
        const moves = this.getValidMoves(this.board, this.currentPlayer);
        if (moves.length === 0) return;
        const [r, c] = this.chooseAIMove(this.board, this.currentPlayer, 'hard');
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('hint'));
        const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add('hint');
        const status = document.getElementById('game-status');
        if (status) status.textContent = `추천 수: ${(this.currentPlayer === 'black' ? '흑' : '백')} ${this.coordToLabel(r, c)}`;
    }

    coordToLabel(row, col) {
        const cols = 'ABCDEFGH';
        return `${cols[col]}${row + 1}`;
    }

    addHistoryEntry(entry) {
        this.moveHistory.push(entry);
        this.updateHistoryList();
    }

    updateHistoryList() {
        const list = document.getElementById('history-list');
        if (!list) return;
        list.innerHTML = '';
        this.moveHistory.forEach((h, idx) => {
            const li = document.createElement('li');
            if (h.type === 'move') {
                li.textContent = `${idx + 1}. ${(h.player === 'black' ? '흑' : '백')} ${this.coordToLabel(h.row, h.col)}`;
            } else {
                li.textContent = `${idx + 1}. ${(h.player === 'black' ? '흑' : '백')} 패스`;
            }
            list.appendChild(li);
        });
        if (list.parentElement) list.parentElement.scrollTop = list.parentElement.scrollHeight;
    }

    snapshotState() {
        return {
            board: this.cloneBoard(this.board),
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            passCount: this.passCount,
            lastMove: this.lastMove ? [...this.lastMove] : null,
            moveHistory: this.moveHistory.map(e => ({ ...e })),
        };
    }

    pushSnapshot() {
        const snap = this.snapshotState();
        this.historyStack.push(snap);
        if (this.historyStack.length > this.maxUndo) this.historyStack.shift();
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = this.historyStack.length === 0;
    }

    restoreState(state) {
        this.board = this.cloneBoard(state.board);
        this.currentPlayer = state.currentPlayer;
        this.gameOver = state.gameOver;
        this.passCount = state.passCount;
        this.lastMove = state.lastMove ? [...state.lastMove] : null;
        this.moveHistory = state.moveHistory.map(e => ({ ...e }));
        if (this.aiTimeoutId) { clearTimeout(this.aiTimeoutId); this.aiTimeoutId = null; }
        if (this.passTimeoutId) { clearTimeout(this.passTimeoutId); this.passTimeoutId = null; }
        this.isAITurnInProgress = false;
        this.renderBoard();
        this.updateDisplay();
    }

    undo() {
        if (this.historyStack.length === 0) return;
        const state = this.historyStack.pop();
        this.restoreState(state);
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = this.historyStack.length === 0;
    }

    getValidMoves(board, player) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.getFlipsForMove(board, r, c, player).length > 0) {
                    moves.push([r, c]);
                }
            }
        }
        return moves;
    }

    cloneBoard(board) {
        return board.map(row => row.slice());
    }

    applyMoveToBoard(board, row, col, player) {
        const newBoard = this.cloneBoard(board);
        const flips = this.getFlipsForMove(newBoard, row, col, player);
        if (flips.length === 0) return newBoard; // 안전장치
        newBoard[row][col] = player;
        for (const [fr, fc] of flips) {
            newBoard[fr][fc] = player;
        }
        return newBoard;
    }

    chooseAIMove(board, player, level) {
        const moves = this.getValidMoves(board, player);
        if (moves.length === 0) return [null, null];
        if (level === 'easy') {
            // 처음 발견한 수
            return moves[0];
        }
        if (level === 'normal') {
            // 가장 많이 뒤집는 수
            let best = moves[0];
            let bestCount = -1;
            for (const [r, c] of moves) {
                const flips = this.getFlipsForMove(board, r, c, player).length;
                if (flips > bestCount) {
                    bestCount = flips;
                    best = [r, c];
                }
            }
            return best;
        }
        // hard: minimax depth 2
        const { move } = this.minimax(board, player, 2, player);
        return move ?? moves[0];
    }

    evaluateBoard(board, aiPlayer) {
        const opp = this.getOpponent(aiPlayer);
        let aiCount = 0;
        let oppCount = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === aiPlayer) aiCount++;
                else if (board[r][c] === opp) oppCount++;
            }
        }
        // 가중치가 큰 건 아니지만, 가벼운 휴리스틱으로 가동
        const discScore = aiCount - oppCount;
        const mobility = this.getValidMoves(board, aiPlayer).length - this.getValidMoves(board, opp).length;
        return discScore * 10 + mobility * 3;
    }

    minimax(board, playerToMove, depth, aiPlayer) {
        const opponent = this.getOpponent(playerToMove);
        const moves = this.getValidMoves(board, playerToMove);
        const oppMoves = this.getValidMoves(board, opponent);

        // 게임 종료 또는 깊이 제한
        const noMovesForBoth = moves.length === 0 && oppMoves.length === 0;
        if (depth === 0 || noMovesForBoth) {
            return { score: this.evaluateBoard(board, aiPlayer), move: null };
        }

        // 현재 플레이어가 둘 수 없으면 패스 (한 플라이 소모)
        if (moves.length === 0) {
            return this.minimax(board, opponent, depth - 1, aiPlayer);
        }

        let bestMove = null;
        let bestScore;
        const isMaximizing = playerToMove === aiPlayer;
        bestScore = isMaximizing ? -Infinity : Infinity;

        for (const [r, c] of moves) {
            const nextBoard = this.applyMoveToBoard(board, r, c, playerToMove);
            const result = this.minimax(nextBoard, opponent, depth - 1, aiPlayer);
            const childScore = result.score;
            if (isMaximizing) {
                if (childScore > bestScore) {
                    bestScore = childScore;
                    bestMove = [r, c];
                }
            } else {
                if (childScore < bestScore) {
                    bestScore = childScore;
                    bestMove = [r, c];
                }
            }
        }
        return { score: bestScore, move: bestMove };
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new OthelloGame();
});
