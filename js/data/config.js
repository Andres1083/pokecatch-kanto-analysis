            }(), t.CONFIG = {
                SAVE_KEY: "gachamon-save-v1",
                get VERSION() {
                    return /v(\d+(?:\.\d+)+)/.exec(t.CHANGELOG?.[0]?.title || "")?.[1] || "?"
                },
                START_MONEY: 3e3,
                START_ITEMS: {},
                TEAM_SIZE: 6,
                RAIL_TILE_MAX: 60,
                SHINY_RATE: 1 / 4096,
                SHINY_STAT_BONUS: .1,
                MAX_LEVEL: 100,
                LEVEL_CAP_MARGIN: 0,
                LEAGUE_DONE_CAP: 100,
                LEAGUE_CAP_MARGIN: 3,
                TIME_WEIGHTS: {
                    10: [1.5, 1, .3],
                    11: [1.5, 1, .3],
                    13: [1.5, 1, .3],
                    14: [1.5, 1, .3],
                    16: [1.5, 1, .2],
                    17: [1.5, 1, .2],
                    21: [1, 1, .2],
                    22: [1, 1, .2],
                    69: [1, 1, .3],
                    70: [1, 1, .3],
                    19: [.6, .6, 1.8],
                    20: [.6, .6, 1.8],
                    43: [.3, .3, 2],
                    44: [.3, .3, 2],
                    48: [.3, .3, 2],
                    49: [.3, .3, 2],
                    52: [.5, .5, 2],
                    35: [.5, .5, 2],
                    92: [.5, .5, 2],
                    93: [.5, .5, 2],
                    96: [.5, .5, 1.8],
                    41: [.7, .7, 1.5]
                },
                TIME_EVOLUTIONS: {
                    196: "day",
                    197: "night"
                },
                WEATHER: {
                    SLOT_MS: 36e5,
                    CHANCE: .54,
                    CLIMATES: {
                        prairie: {
                            rain: 2,
                            sun: 2,
                            storm: .5
                        },
                        town: {
                            rain: 2,
                            sun: 1
                        },
                        forest: {
                            rain: 3,
                            sun: 1,
                            storm: .5
                        },
                        lake: {
                            rain: 3,
                            sun: 1,
                            storm: 1
                        },
                        pier: {
                            rain: 3,
                            sun: 1,
                            storm: 1
                        },
                        beach: {
                            sun: 3,
                            rain: 1,
                            storm: .5
                        },
                        mountain: {
                            rain: 2,
                            sun: 1,
                            snow: 1,
                            storm: .5
                        }
                    },
                    REGION_OFF: {
                        kanto: ["sun"],
                        johto: ["sun"]
                    },
                    TRANSLATE: {
                        rain: ["snow"],
                        storm: ["rain", "snow"],
                        snow: ["rain"],
                        sun: [],
                        sand: [],
                        ash: [],
                        fog: [],
                        breeze: []
                    },
                    TYPES: {
                        rain: {
                            name: "Pluie",
                            icon: "🌧️",
                            encounters: {
                                water: 1.6,
                                electric: 1.2,
                                fire: .6
                            },
                            damage: {
                                water: 1.1,
                                fire: .9
                            }
                        },
                        storm: {
                            name: "Orage",
                            icon: "⛈️",
                            encounters: {
                                electric: 1.8,
                                water: 1.4,
                                fire: .5
                            },
                            damage: {
                                water: 1.1,
                                electric: 1.1,
                                fire: .9
                            }
                        },
                        sun: {
                            name: "Soleil ardent",
                            icon: "🔆",
                            daylight: !0,
                            encounters: {
                                fire: 1.6,
                                grass: 1.3,
                                water: .7
                            },
                            damage: {
                                fire: 1.1,
                                water: .9
                            }
                        },
                        sand: {
                            name: "Tempête de sable",
                            icon: "🌪️",
                            encounters: {
                                ground: 1.6,
                                rock: 1.6,
                                steel: 1.4,
                                grass: .7
                            }
                        },
                        snow: {
                            name: "Neige",
                            icon: "❄️",
                            encounters: {
                                ice: 2,
                                water: 1.2,
                                fire: .6,
                                grass: .7
                            }
                        },
                        ash: {
                            name: "Cendres",
                            icon: "🌋",
                            encounters: {
                                fire: 1.4,
                                ground: 1.2,
                                grass: .6,
                                water: .7
                            }
                        },
                        fog: {
                            name: "Brouillard",
                            icon: "🌫️",
                            encounters: {
                                ghost: 1.8,
                                psychic: 1.3,
                                flying: .6
                            },
                            damage: {
                                ghost: 1.1
                            }
                        },
                        breeze: {
                            name: "Vent léger",
                            icon: "🍃",
                            encounters: {
                                flying: 1.5,
                                dragon: 1.2
                            }
                        }
                    }
                },
                CONDITIONAL_WILD: {
                    OFF: 0,
                    DROP: .2,
                    RULES: [{
                        bg: "prairie",
                        when: ["morning"],
                        add: [
                            [165, .06],
                            [187, .06]
                        ]
                    }, {
                        bg: "prairie",
                        when: ["day"],
                        add: [
                            [128, .03],
                            [203, .05]
                        ]
                    }, {
                        bg: "prairie",
                        when: ["night"],
                        add: [
                            [163, .07],
                            [43, .06],
                            [228, .05]
                        ],
                        drop: [16, 21, 10]
                    }, {
                        bg: "forest",
                        when: ["morning"],
                        add: [
                            [10, .06],
                            [13, .06],
                            [191, .05]
                        ]
                    }, {
                        bg: "forest",
                        when: ["day"],
                        add: [
                            [123, .03],
                            [127, .03]
                        ]
                    }, {
                        bg: "forest",
                        when: ["night"],
                        add: [
                            [92, .08],
                            [167, .06],
                            [164, .04],
                            [198, .03]
                        ],
                        drop: [10, 11, 13, 14, 16, 17]
                    }, {
                        bg: "town",
                        when: ["night"],
                        add: [
                            [52, .06],
                            [198, .05],
                            [200, .03]
                        ]
                    }, {
                        bg: "lake",
                        when: ["night"],
                        add: [
                            [170, .06],
                            [211, .05]
                        ]
                    }, {
                        bg: "pier",
                        when: ["night"],
                        add: [
                            [170, .06],
                            [211, .05]
                        ]
                    }, {
                        bg: "beach",
                        when: ["day"],
                        add: [
                            [90, .06]
                        ]
                    }, {
                        bg: "beach",
                        when: ["night"],
                        add: [
                            [120, .06],
                            [170, .05]
                        ]
                    }, {
                        bg: "mountain",
                        when: ["day"],
                        add: [
                            [74, .06]
                        ]
                    }, {
                        bg: "mountain",
                        when: ["night"],
                        add: [
                            [35, .05],
                            [229, .03],
                            [200, .03]
                        ]
                    }, {
                        area: "gsc:celadon-city-area",
                        when: ["day"],
                        only: !0,
                        add: [
                            [133, .005]
                        ]
                    }, {
                        area: "kanto-route-1-area",
                        when: ["rain"],
                        only: !0,
                        evolve: !0,
                        add: [
                            [7, .05]
                        ]
                    }]
                },
                NIGHT_DAMAGE: {
                    ghost: 1.1,
                    dark: 1.1
                },
                NIGHT_SLEEP: .35,
                TIERS: [{
                    key: "common",
                    label: "Commun",
                    ball: "poke-ball",
                    color: "#9aa4b1",
                    sell: 40,
                    level: [2, 8]
                }, {
                    key: "uncommon",
                    label: "Peu commun",
                    ball: "great-ball",
                    color: "#3b82f6",
                    sell: 120,
                    level: [8, 18]
                }, {
                    key: "rare",
                    label: "Rare",
                    ball: "ultra-ball",
                    color: "#a855f7",
                    sell: 350,
                    level: [15, 30]
                }, {
                    key: "legendary",
                    label: "Légendaire",
                    ball: "ultra-ball",
                    color: "#f5c518",
                    sell: 5e3,
                    level: [50, 60]
                }, {
                    key: "unique",
                    label: "Unique",
                    ball: "master-ball",
                    color: "#ff5fa2",
                    sell: 0,
                    level: [5, 100]
                }],
                CAPTURE_BONUS: .6,
                CAPTURE_MAX: .6,
                LEGENDARY_CAPTURE_RATE: 3,
                ROAMING: {
                    GROUPS: [{
                        ids: [243, 244, 245],
                        unlock: "Maître Johto",
                        regions: ["johto"]
                    }, {
                        ids: [380, 381],
                        unlock: "Maître Hoenn",
                        regions: ["hoenn"]
                    }],
                    STAY_MIN: 10,
                    CATCH: .02,
                    MIN_LEVEL: 100,
                    WEATHER: {
                        243: "storm",
                        244: "sun",
                        245: "rain",
                        380: "breeze",
                        381: "breeze"
                    }
                },
                STEP_MS: 650,
                SPEEDS: [1, 2, 4],
                OFFLINE_MAX_MS: 8 * 3600 * 1e3,
                OFFLINE_ITEM_LIMIT: 10,
                OFFLINE_STEP_MS: 1500,
                ACTION_MS: 2800,
                OFFLINE_MAX_LEVELS: 12,
                OFFLINE_XP_MULT: .5,
                CEREMONY_MS: 8e3,
                PACE: {
                    firstMin: 10,
                    lastMin: 400,
                    chapters: 14
                },
                get CHAPTER_TIME_RATIO() {
                    return (this.PACE.lastMin / this.PACE.firstMin) ** (1 / (this.PACE.chapters - 1))
                },
                XP_WINS_PER_LEVEL: 15,
                XP_GROWTH_FROM: 10,
                XP_SCALE: 3,
                REGION_XP: {
                    johto: 1.25,
                    hoenn: 1.25
                },
                XP_GROWTH_EXTRA: 1,
                get XP_LEVEL_GROWTH() {
                    return this.CHAPTER_TIME_RATIO ** (1 / 8) * this.XP_GROWTH_EXTRA
                },
                XP_BASE_REF: 60,
                XP_ACTIVE_BONUS: 1.1,
                CANDY_LEVEL_SHARE: 3,
                EXP_CANDY_MULT: .6,
                DUPLICATE_CANDIES: 1,
                DRAIN: {
                    absorb: .25,
                    "mega-drain": .25,
                    "giga-drain": .25,
                    "leech-life": .25,
                    "drain-punch": .25,
                    "draining-kiss": .5
                },
                BUDDY_XP_MULT: 1.3,
                BUDDY_KOS: [5, 10, 20, 50, 50],
                BUDDY_RAMP_LEVEL: 20,
                PENSION: {
                    BERRIES: {
                        "berry-oran": {
                            name: "Baie Oran",
                            minutes: 5,
                            weight: 18,
                            rarity: "Commune",
                            src: "assets/ui/berry-oran.png",
                            bounds: [7, 7, 26, 25]
                        },
                        "berry-pecha": {
                            name: "Baie Pêcha",
                            minutes: 15,
                            weight: 8,
                            rarity: "Peu commune",
                            src: "assets/ui/berry-pecha.png",
                            bounds: [6, 6, 26, 26]
                        },
                        "berry-sitrus": {
                            name: "Baie Sitrus",
                            minutes: 30,
                            weight: 3,
                            rarity: "Rare",
                            src: "assets/ui/berry-sitrus.png",
                            bounds: [7, 6, 25, 26]
                        }
                    },
                    SLOTS: 4,
                    OFFLINE_MS: 8 * 3600 * 1e3,
                    INCUBATOR: 4,
                    SLOT_SHOP: [{
                        price: 15e3
                    }, {
                        price: 15e4,
                        done: "kanto"
                    }, {
                        price: 6e5,
                        done: "johto"
                    }],
                    INCUBATOR_SHOP: [{
