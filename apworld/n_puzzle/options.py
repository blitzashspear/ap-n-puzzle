from dataclasses import dataclass
from Options import PerGameCommonOptions, Choice, Toggle, OptionSet

class NValue(Choice):
    """
    Pick how big your puzzle will be.
    8-puzzle: 3x3
    15-puzzle: 4x4
    """
    display_name = "n-Value"
    default = 0
    option_8 = 0
    option_15 = 1
    option_24 = 2
    option_35 = 3
    
@dataclass
class NPuzzleOptions(PerGameCommonOptions):
    n_value: NValue