from dataclasses import dataclass
from Options import PerGameCommonOptions, Choice

class Size(Choice):
    """
    Choose how big you want your puzzle.
    """
    display_name = "size"
    default = 0
    option_8 = 0
    option_15 = 1
    option_24 = 2
    option_35 = 3
    
@dataclass
class NPuzzleOptions(PerGameCommonOptions):
    size: Size