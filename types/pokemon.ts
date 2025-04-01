export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: {
    name: string
    url: string
  }[]
}

export interface PokemonDetails {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  sprites: {
    front_default: string
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
    back_default: string | null
    back_female: string | null
    back_shiny: string | null
    back_shiny_female: string | null
    other: {
      "official-artwork": {
        front_default: string
        front_shiny: string | null
      }
      home: {
        front_default: string | null
        front_female: string | null
        front_shiny: string | null
        front_shiny_female: string | null
      }
      showdown: {
        front_default: string | null
        front_female: string | null
        front_shiny: string | null
        front_shiny_female: string | null
        back_default: string | null
        back_female: string | null
        back_shiny: string | null
        back_shiny_female: string | null
      }
    }
    versions: Record<
      string,
      Record<
        string,
        {
          front_default: string | null
          front_female: string | null
          front_shiny: string | null
          front_shiny_female: string | null
          back_default: string | null
          back_female: string | null
          back_shiny: string | null
          back_shiny_female: string | null
        }
      >
    >
  }
  types: {
    slot: number
    type: {
      name: string
      url: string
    }
  }[]
  abilities: {
    ability: {
      name: string
      url: string
    }
    is_hidden: boolean
    slot: number
  }[]
  stats: {
    base_stat: number
    effort: number
    stat: {
      name: string
      url: string
    }
  }[]
  moves: {
    move: {
      name: string
      url: string
    }
    version_group_details: {
      level_learned_at: number
      move_learn_method: {
        name: string
        url: string
      }
      version_group: {
        name: string
        url: string
      }
    }[]
  }[]
  game_indices: {
    game_index: number
    version: {
      name: string
      url: string
    }
  }[]
  species: {
    name: string
    url: string
  }
}

export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: {
    name: string
    url: string
  }
  pokedex_numbers: {
    entry_number: number
    pokedex: {
      name: string
      url: string
    }
  }[]
  egg_groups: {
    name: string
    url: string
  }[]
  color: {
    name: string
    url: string
  }
  shape: {
    name: string
    url: string
  }
  evolves_from_species: {
    name: string
    url: string
  } | null
  evolution_chain: {
    url: string
  }
  habitat: {
    name: string
    url: string
  } | null
  generation: {
    name: string
    url: string
  }
  names: {
    name: string
    language: {
      name: string
      url: string
    }
  }[]
  flavor_text_entries: {
    flavor_text: string
    language: {
      name: string
      url: string
    }
    version: {
      name: string
      url: string
    }
  }[]
  form_descriptions: {
    description: string
    language: {
      name: string
      url: string
    }
  }[]
  varieties: {
    is_default: boolean
    pokemon: {
      name: string
      url: string
    }
  }[]
}

export interface EvolutionChain {
  id: number
  baby_trigger_item: null | {
    name: string
    url: string
  }
  chain: EvolutionChainLink
}

export interface EvolutionChainLink {
  is_baby: boolean
  species: {
    name: string
    url: string
  }
  evolution_details: EvolutionDetail[] | null
  evolves_to: EvolutionChainLink[]
}

export interface EvolutionDetail {
  item: null | {
    name: string
    url: string
  }
  trigger: {
    name: string
    url: string
  }
  gender: number | null
  held_item: null | {
    name: string
    url: string
  }
  known_move: null | {
    name: string
    url: string
  }
  known_move_type: null | {
    name: string
    url: string
  }
  location: null | {
    name: string
    url: string
  }
  min_level: number | null
  min_happiness: number | null
  min_beauty: number | null
  min_affection: number | null
  needs_overworld_rain: boolean
  party_species: null | {
    name: string
    url: string
  }
  party_type: null | {
    name: string
    url: string
  }
  relative_physical_stats: number | null
  time_of_day: string
  trade_species: null | {
    name: string
    url: string
  }
  turn_upside_down: boolean
}

export interface MoveDetails {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  damage_class: {
    name: string
    url: string
  }
  type: {
    name: string
    url: string
  }
  effect_entries: {
    effect: string
    short_effect: string
    language: {
      name: string
      url: string
    }
  }[]
}

export interface MoveWithType {
  move: string
  level?: number
  game?: string
  versionGroup: string
  type: string
  url: string
}

export interface EggGroup {
  id: number
  name: string
  names: {
    name: string
    language: {
      name: string
      url: string
    }
  }[]
  pokemon_species: {
    name: string
    url: string
  }[]
}

