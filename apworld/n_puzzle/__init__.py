from worlds.AutoWorld import World, WebWorld
from BaseClasses import Tutorial, Region, Location, Item, ItemClassification
from rule_builder.rules import Has, HasGroupUnique
from .options import NPuzzleOptions, OPTION_TO_SIZE
from .puzzle import generate_puzzle

max_puzzle_size = max(OPTION_TO_SIZE.values())

def get_item_name(x: int):
    return str(x)

def get_position_name(x: int):
    return f"{x}'s Position"

def get_total_position_name(x: int):
    return f"{x} Total Position{'s' if x > 1 else ''}"

LOCATION_IDS = {}
ITEM_IDS = {}
ITEM_GROUPS = {
    "number": set()
}
for i in range(1, max_puzzle_size):
    LOCATION_IDS[get_position_name(i)] = i
    LOCATION_IDS[get_total_position_name(i)] = i+1000
    ITEM_IDS[get_item_name(i)] = i
    ITEM_GROUPS["number"].add(get_item_name(i))
LOCATION_IDS["Starting Number"] = 999

silly_emoticons = [":)", ":(", ">:(", ":3", ":D", "D:", "8)", ":))", "XD", ":P", ":|", ":')"]
for i, silly_emoticon in enumerate(silly_emoticons):
    ITEM_IDS[silly_emoticon] = i+200
ITEM_IDS["Solved Puzzle"] = 999

class NPuzzleWebWorld(WebWorld):
    game = "n-Puzzle"
    theme = "stone"

    setup_en = Tutorial(
        "Multiworld Setup Guide",
        "A guide to setting up n-Puzzle for Archipelago.",
        "English",
        "setup_en.md",
        "setup/en",
        ["blitzashspear"]
    )
    tutorials = [setup_en]

class NPuzzleLocation(Location):
    game = "n-Puzzle"
    
class NPuzzleItem(Item):
    game = "n-Puzzle"

class NPuzzleWorld(World):
    """
    It's everybody's favorite time waster: the sliding puzzle!
    Now with 4 different sizes to choose from!
    """

    game = "n-Puzzle"
    web = NPuzzleWebWorld()
    options_dataclass = NPuzzleOptions
    options: NPuzzleOptions
    location_name_to_id = LOCATION_IDS
    item_name_to_id = ITEM_IDS
    item_name_groups = ITEM_GROUPS
    origin_region_name = "Game Board"

    def create_regions(self) -> None:
        def get_location_name_with_id(location_name: str) -> dict[str, int]:
            return {location_name: LOCATION_IDS[location_name]}

        game_board = Region("Game Board", self.player, self.multiworld)
        game_board.add_locations(get_location_name_with_id(
            "Starting Number"
        ), NPuzzleLocation)
        for i in range(1, OPTION_TO_SIZE[self.options.size]):
            game_board.add_locations(get_location_name_with_id(
                get_position_name(i)
            ), NPuzzleLocation)
            game_board.add_locations(get_location_name_with_id(
                get_total_position_name(i)
            ), NPuzzleLocation)

        self.multiworld.regions += [game_board]

    def set_rules(self) -> None:
        # First time using rule builder. My attempt at using lambda states failed due to ✧˖°Lambda Capture⋆˙⟡. Using for loops with lambdas is bad.
        player_size = OPTION_TO_SIZE[self.options.size]
        for i in range(1, player_size):
            self.set_rule(self.get_location(get_position_name(i)), Has(get_item_name(i)))
            self.set_rule(self.get_location(get_total_position_name(i)), HasGroupUnique("number", i))
        self.set_completion_rule(Has("Solved Puzzle"))

    def create_items(self) -> None:
        player_size = OPTION_TO_SIZE[self.options.size]
        starting_item = get_item_name(self.random.choice(range(1, player_size)))
        self.get_location("Starting Number").place_locked_item(self.create_item(starting_item))
        itempool = []
        for item in [get_item_name(i) for i in range(1, player_size)]:
            if item != starting_item:
                itempool.append(self.create_item(item))
        self.get_location(get_total_position_name(player_size-1)).place_locked_item(self.create_item("Solved Puzzle"))

        itempool_filler_items = len(self.multiworld.get_unfilled_locations(self.player)) - len(itempool)
        itempool += [self.create_filler() for _ in range(itempool_filler_items)]

        self.multiworld.itempool += itempool

    def create_item(self, name: str) -> NPuzzleItem:
        if name not in silly_emoticons:
            return NPuzzleItem(name, ItemClassification.progression, ITEM_IDS[name], self.player)
        return NPuzzleItem(name, ItemClassification.filler, ITEM_IDS[name], self.player)

    def get_filler_item_name(self):
        return self.random.choice(silly_emoticons)

    def fill_slot_data(self):
        return {
            "size": OPTION_TO_SIZE[self.options.size],
            "puzzle": generate_puzzle(self),
            "death_link": self.options.death_link
        }
