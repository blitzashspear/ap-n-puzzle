from worlds.AutoWorld import World, WebWorld
from BaseClasses import Tutorial, Region, Location, Item, ItemClassification
from .options import NPuzzleOptions

OPTION_TO_SIZE = {
    0: 9,
    1: 16,
    2: 25,
    3: 36
}

LOCATION_IDS = {}
max_puzzle_size = max(OPTION_TO_SIZE.values())
for i in range(1, max_puzzle_size):
    LOCATION_IDS[f"{i}'s Position"] = i
for i in range(1, max_puzzle_size):
    LOCATION_IDS[f"{i} Total Position{"s" if i > 1 else ""}"] = i+1000
LOCATION_IDS["Starting Number"] = 10000

ITEM_IDS = {}
for i in range(1, max_puzzle_size):
    ITEM_IDS[str(i)]
silly_emoticons = [":)", ":(", ">:(", ":3", ":D", "D:", "8)", ":))", "XD", ":P", ":|", ":')"]
for i, silly_emoticon in enumerate(silly_emoticons):
    ITEM_IDS[silly_emoticon] = 9000+i

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
    web = NPuzzleWebWorld
    options_dataclass = NPuzzleOptions
    options: NPuzzleOptions
    location_name_to_id = LOCATION_IDS
    item_name_to_id = ITEM_IDS
    origin_region_name = "Game Board"

    def create_regions(self) -> None:
        def get_location_name_with_id(location_name: str) -> dict[str, int | None]:
            return {location_name: LOCATION_IDS[location_name]}

        game_board = Region("Game Board", self.player, self.multiworld)
        game_board.add_locations(get_location_name_with_id(
            "Starting Number"
        ), NPuzzleLocation)
        for i in range(1, OPTION_TO_SIZE[self.options.n_value]):
            game_board.add_locations(get_location_name_with_id(
                f"{i}'s Position"
            ), NPuzzleLocation)
            game_board.add_locations(get_location_name_with_id(
                f"{i} Total Position{"s" if i > 1 else ""}"
            ), NPuzzleLocation)

        self.multiworld.regions += [game_board]

    def set_rules(self) -> None:
        # TODO
        self.multiworld.completion_condition[self.player] = lambda state: state.has_all((str(i) for i in range(1, OPTION_TO_SIZE[self.options.n_value])), self.player)

    def create_items(self) -> None:
        starting_item = str(self.random.choice(range(1, OPTION_TO_SIZE[self.options.n_value])))
        self.get_location("Starting Number").place_locked_item(self.create_item(starting_item))
        item_names = [str(i) for i in range(1, OPTION_TO_SIZE[self.options.n_value])]
        itempool = [self.create_item(item_name) for item_name in item_names]
        self.multiworld.itempool += itempool

    def create_item(self, name: str) -> NPuzzleItem:
        if name not in silly_emoticons:
            return NPuzzleItem(name, ItemClassification.progression, ITEM_IDS[name])
        return NPuzzleItem(name, ItemClassification.filler)

    def get_filler_item_name(self):
        return self.random.choice(silly_emoticons)