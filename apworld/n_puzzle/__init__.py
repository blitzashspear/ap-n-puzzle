from worlds.AutoWorld import World, WebWorld
from BaseClasses import Tutorial, Region, Location, Item, ItemClassification
from .options import NPuzzleOptions
from .puzzle import generate_puzzle

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

max_puzzle_size = max(OPTION_TO_SIZE.values())

def item_name(x: int):
    return str(x)

def position_name(x: int):
    return f"{x}'s Position"

def total_position_name(x: int):
    return f"{i} Total Position{"s" if i > 1 else ""}"

LOCATION_IDS = {}
ITEM_IDS = {}
ITEM_GROUPS = {
    "number": set(),
    "emoticon": set()
}
for i in range(1, 36):
    LOCATION_IDS[position_name(i)] = i
    LOCATION_IDS[total_position_name(i)] = i+101
    ITEM_IDS[item_name(i)] = i
    ITEM_GROUPS["number"].add(item_name(i))
LOCATION_IDS["Starting Number"] = 999

silly_emoticons = [":)", ":(", ">:(", ":3", ":D", "D:", "8)", ":))", "XD", ":P", ":|", ":')"]
for i, silly_emoticon in enumerate(silly_emoticons):
    ITEM_IDS[silly_emoticon] = 100+i
    ITEM_GROUPS["emoticon"].add(silly_emoticon)
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
        def get_location_name_with_id(location_name: str) -> dict[str, int | None]:
            return {location_name: LOCATION_IDS[location_name]}

        game_board = Region("Game Board", self.player, self.multiworld)
        game_board.add_locations(get_location_name_with_id(
            "Starting Number"
        ), NPuzzleLocation)
        for i in range(1, OPTION_TO_SIZE[self.options.size]):
            game_board.add_locations(get_location_name_with_id(
                position_name(i)
            ), NPuzzleLocation)
            game_board.add_locations(get_location_name_with_id(
                total_position_name(i)
            ), NPuzzleLocation)

        self.multiworld.regions += [game_board]

    def set_rules(self) -> None:
        for i in range(1, max_puzzle_size):
            self.set_rule(self.get_location(position_name(i)), lambda state: state.has(item_name(i), self.player))
            self.set_rule(self.get_location(total_position_name(i)), lambda state: state.has_group_unique("numbers", self.player, i))
        
        self.multiworld.completion_condition[self.player] = lambda state: state.has("Solved Puzzle", self.player)

    def create_items(self) -> None:
        player_size = OPTION_TO_SIZE[self.options.size]
        starting_item = item_name(self.random.choice(range(1, player_size)))
        self.get_location("Starting Number").place_locked_item(self.create_item(starting_item))
        itempool = []
        for item in [item_name(i) for i in range(1, player_size)]:
            if item != starting_item:
                itempool.append(self.create_item(item))
        self.get_location(total_position_name(max_puzzle_size-1)).place_locked_item(self.create_item("Solved Puzzle"))
        self.multiworld.itempool += itempool

    def create_item(self, name: str) -> NPuzzleItem:
        if name not in silly_emoticons:
            return NPuzzleItem(name, ItemClassification.progression, ITEM_IDS[name])
        return NPuzzleItem(name, ItemClassification.filler, ITEM_IDS[name])

    def get_filler_item_name(self):
        return self.random.choice(silly_emoticons)

    def fill_slot_data(self):
        return {
            "size": self.options.size,
            "puzzle": generate_puzzle(self)
        }
