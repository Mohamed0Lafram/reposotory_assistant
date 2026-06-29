# basic_stockfish.py
from stockfish import Stockfish

# Initialize Stockfish
# If stockfish is in your PATH, you can use just:
stockfish = Stockfish()

# Or specify path explicitly:
# stockfish = Stockfish(path="/usr/bin/stockfish")
# stockfish = Stockfish(path="C:/stockfish/stockfish.exe")

# Basic configuration
stockfish.set_depth(15)
stockfish.set_skill_level(20)  # 0-20, where 20 is strongest

# Get best move from current position
best_move = stockfish.get_best_move()
print(f"Best move: {best_move}")

# Get best move with thinking time
best_move = stockfish.get_best_move_time(1000)  # 1000ms = 1 second
print(f"Best move with 1s thinking: {best_move}")