from __future__ import annotations

from pathlib import Path

from loguru import logger


def configure_logger(log_path: Path) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    logger.remove()
    logger.add(
        log_path,
        rotation="1 MB",
        retention=5,
        serialize=True,
        enqueue=False,
        backtrace=False,
        diagnose=False,
    )
    logger.add(lambda message: print(message, end=""), level="INFO", format="{message}")

