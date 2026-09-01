from dataclasses import dataclass
from Options import PerGameCommonOptions, Choice, Toggle

class Size(Choice):
    """
    Choose how big you want your puzzle.
    """
    display_name = "size"
    default = 0
    option_3x3 = 0
    option_4x4 = 1
    option_5x5 = 2
    option_6x6 = 3

class NPuzzleDeathLink(Toggle):
    """When you attempt to move a tile that is not next to a blank tile, everyone who enabled death link dies. When someone else dies, your puzzle is forcibly reset. Currently not implemented."""
    display_name = "Death Link"
    default = False

OPTION_TO_SIZE = {
    0: 9,
    1: 16,
    2: 25,
    3: 36
    # 4: 49,
    # 5: 64,
    # 6: 81,
    # 7: 100
}

@dataclass
class NPuzzleOptions(PerGameCommonOptions):
    # death_link: NPuzzleDeathLink
    size: Size