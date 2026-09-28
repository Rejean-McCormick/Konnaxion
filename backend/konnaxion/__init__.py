from pkgutil import extend_path

# Allow separately versioned Konnaxion infrastructure distributions (notably
# Konnaxion_Worlds) to contribute subpackages under the ``konnaxion`` namespace.
__path__ = extend_path(__path__, __name__)

# FILE: backend/konnaxion/__init__.py
__version__ = "0.1.0"
__version_info__ = tuple(
    int(num) if num.isdigit() else num
    for num in __version__.replace("-", ".", 1).split(".")
)
