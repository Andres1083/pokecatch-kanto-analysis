                CHAPTERS: [{
                    name: "Badge Roche",
                    region: "Bourg Palette → Argenta",
                    day: !0,
                    aceUp: 2,
                    capMargin: 4,
                    zoneFrom: 5,
                    steps: [{
                        kind: "gift",
                        name: "Labo du Prof. Chen",
                        bg: "town",
                        gift: {
                            key: "starter",
                            choices: [1, 4, 7],
                            level: 5,
                            text: "Le Prof. Chen te propose un Pokémon !"
                        }
                    }, {
                        kind: "route",
                        name: "Route 1",
                        bg: "prairie",
                        areas: ["kanto-route-1-area"],
                        lv: [2, 3],
                        wild: 3,
                        trainers: 0,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Jadielle",
                        bg: "town"
                    }, {
                        kind: "route",
                        name: "Route 2",
                        bg: "prairie",
                        areas: ["kanto-route-2-south-towards-viridian-city"],
                        lv: [4, 7],
                        wild: 2,
                        trainers: 0
                    }, {
                        kind: "route",
                        name: "Forêt de Jade",
                        bg: "forest",
                        areas: ["viridian-forest-area"],
                        wild: 4,
                        trainers: 2,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Argenta",
                        bg: "town"
                    }, {
                        kind: "find",
                        name: "Musée d'Argenta",
                        bg: "town",
                        item: "old-amber",
                        once: "old-amber"
                    }, {
                        kind: "gym",
                        name: "Arène d'Argenta",
                        bg: "gym-rock",
                        fallback: "mountain",
                        leader: "Pierre",
                        sprite: "brock",
                        type: "rock",
                        badge: "Roche",
                        color: "#9a8b6a",
                        reward: 1386,
                        power: 1.22,
                        ace: 15,
                        team: [
                            [74, 14],
                            [95, 15]
                        ]
                    }]
                }, {
                    name: "Badge Cascade",
                    region: "Route 3 → Azuria",
                    aceUp: 2,
                    steps: [{
                        kind: "route",
                        name: "Route 3",
                        bg: "mountain",
                        areas: ["kanto-route-3-area"],
                        wild: 2,
                        trainers: 3
                    }, {
                        kind: "gift",
                        name: "Centre Pokémon (Route 4)",
                        bg: "town",
                        gift: {
                            key: "magikarp",
                            choices: [129],
                            level: 5,
                            text: "Un vendeur louche t'offre un Magicarpe…"
                        }
                    }, {
                        kind: "route",
                        name: "Mont Sélénite",
                        bg: "cave",
                        areas: ["mt-moon-1f", "mt-moon-b1f", "mt-moon-b2f"],
                        wild: 4,
                        trainers: 2,
                        item: !0
                    }, {
                        kind: "gift",
                        name: "Mont Sélénite",
                        bg: "cave",
                        gift: {
                            key: "fossil",
                            items: ["dome-fossil", "helix-fossil"],
                            text: "Deux fossiles au fond de la grotte… lequel prends-tu ?"
                        }
                    }, {
                        kind: "route",
                        name: "Route 4",
                        bg: "prairie",
                        areas: ["kanto-route-4-area"],
                        wild: 3,
                        trainers: 2
                    }, {
                        kind: "heal",
                        name: "Azuria",
                        bg: "town"
                    }, {
                        kind: "route",
                        name: "Pont Pépite",
                        bg: "lake",
                        areas: ["kanto-route-24-area", "kanto-route-25-area"],
                        wild: 4,
                        trainers: 5,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Azuria",
                        bg: "town"
                    }, {
                        kind: "gym",
                        name: "Arène d'Azuria",
                        bg: "gym-water",
                        fallback: "lake",
                        leader: "Ondine",
                        sprite: "misty",
                        type: "water",
                        badge: "Cascade",
                        color: "#4aa3df",
                        reward: 2079,
                        power: 1.06,
                        team: [
                            [120, 18],
                            [54, 19],
                            [121, 21]
                        ]
                    }]
                }, {
                    name: "Badge Foudre",
                    region: "Route 5 → Carmin sur Mer",
                    steps: [{
                        kind: "route",
                        name: "Route 5",
                        bg: "prairie",
                        areas: ["kanto-route-5-area"],
                        wild: 3,
                        trainers: 2
                    }, {
                        kind: "route",
                        name: "Route 6",
                        bg: "prairie",
                        areas: ["kanto-route-6-area"],
                        wild: 3,
                        trainers: 2,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Carmin sur Mer",
                        bg: "pier"
                    }, {
                        kind: "route",
                        name: "Océane",
                        bg: "pier",
                        areas: ["kanto-route-6-area"],
                        wild: 0,
                        trainers: 3,
                        item: !0
                    }, {
                        kind: "route",
                        name: "Route 11",
                        bg: "prairie",
                        areas: ["kanto-route-11-area"],
                        wild: 4,
                        trainers: 3
                    }, {
                        kind: "route",
                        name: "Grotte Taupiqueur",
                        bg: "cave",
                        areas: ["digletts-cave-area"],
                        wild: 4,
                        trainers: 1
                    }, {
                        kind: "heal",
                        name: "Carmin sur Mer",
                        bg: "pier"
                    }, {
                        kind: "gym",
                        name: "Arène de Carmin",
                        bg: "gym-electric",
                        fallback: "town",
                        leader: "Major Bob",
                        sprite: "ltsurge",
                        type: "electric",
                        badge: "Foudre",
                        color: "#f7d02c",
                        reward: 2376,
                        power: 1.15,
                        team: [
                            [100, 21],
                            [25, 18],
                            [82, 22],
                            [26, 24]
                        ]
                    }]
                }, {
                    name: "Badge Prisme",
                    region: "Route 9 → Céladopole",
                    steps: [{
                        kind: "route",
                        name: "Route 9",
                        bg: "mountain",
                        areas: ["kanto-route-9-area"],
                        wild: 2,
                        trainers: 2
                    }, {
                        kind: "route",
                        name: "Route 10",
                        bg: "mountain",
                        areas: ["kanto-route-10-area"],
                        wild: 2,
                        trainers: 0
                    }, {
                        kind: "route",
                        name: "Grotte",
                        bg: "cave",
                        areas: ["rock-tunnel-b1f", "rock-tunnel-b2f"],
                        wild: 4,
                        trainers: 3,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Lavanville",
                        bg: "town"
                    }, {
                        kind: "route",
                        name: "Route 8",
                        bg: "prairie",
                        areas: ["kanto-route-8-area"],
                        wild: 3,
                        trainers: 2
                    }, {
                        kind: "route",
                        name: "Route 7",
                        bg: "prairie",
                        areas: ["kanto-route-7-area"],
                        wild: 2,
                        trainers: 0
                    }, {
                        kind: "heal",
                        name: "Céladopole",
                        bg: "town"
                    }, {
                        kind: "gift",
                        name: "Manoir Céladon",
                        bg: "town",
                        gift: {
                            key: "eevee",
                            choices: [133],
                            level: 28,
                            text: "Une Poké Ball traîne sur une table… c'est un Évoli !"
                        }
                    }, {
                        kind: "gym",
                        name: "Arène de Céladopole",
                        bg: "gym-grass",
                        fallback: "forest",
                        leader: "Erika",
                        sprite: "erika",
                        type: "grass",
                        badge: "Prisme",
                        color: "#7ac74c",
                        reward: 2871,
                        power: 1.1,
                        team: [
                            [114, 24],
                            [47, 27],
                            [103, 26],
                            [71, 29],
                            [45, 29]
                        ]
                    }]
                }, {
                    name: "Badge Âme",
                    region: "Tour Pokémon → Parmanie",
                    steps: [{
                        kind: "route",
                        name: "Tour Pokémon",
                        bg: "cave",
                        areas: ["pokemon-tower-3f", "pokemon-tower-4f", "pokemon-tower-5f", "pokemon-tower-6f", "pokemon-tower-7f"],
                        wild: 4,
                        trainers: 2,
                        item: !0,
                        veil: {
                            after: "silph-scope",
                            types: ["ghost"]
                        }
                    }, {
                        kind: "static",
                        name: "Tour Pokémon",
                        bg: "cave",
                        id: 105,
                        level: 45,
                        spirit: !0,
                        after: "silph-scope",
                        once: "marowak-ghost",
                        text: "Le fantôme d'une mère Ossatueur barre le sommet de la Tour !",
                        reward: {
                            key: "cubone-fuji",
                            choices: [104],
                            level: 30,
                            text: "L'âme d'Ossatueur s'apaise… M. Fuji te confie son petit."
                        }
                    }, {
                        kind: "heal",
                        name: "Lavanville",
                        bg: "town"
                    }, {
                        kind: "static",
                        name: "Route 12",
                        bg: "lake",
                        id: 143,
                        level: 38,
                        text: "Un Ronflex bloque le passage !"
                    }, {
                        kind: "route",
                        name: "Route 12-13",
                        bg: "lake",
                        areas: ["kanto-route-12-area", "kanto-route-13-area"],
                        wild: 3,
                        trainers: 3
                    }, {
                        kind: "route",
                        name: "Route 14-15",
                        bg: "prairie",
                        areas: ["kanto-route-14-area", "kanto-route-15-area"],
                        wild: 3,
                        trainers: 2,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Parmanie",
                        bg: "town"
                    }, {
                        kind: "route",
                        name: "Parc Safari",
                        bg: "forest",
                        areas: ["kanto-safari-zone-middle", "kanto-safari-zone-area-1-east", "kanto-safari-zone-area-2-north", "kanto-safari-zone-area-3-west"],
                        wild: 5,
                        trainers: 0,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Parmanie",
                        bg: "town"
                    }, {
                        kind: "gym",
                        name: "Arène de Parmanie",
                        bg: "gym-poison",
                        fallback: "forest",
                        leader: "Koga",
                        sprite: "koga",
                        type: "poison",
                        badge: "Âme",
                        color: "#a33ea1",
                        reward: 4257,
                        power: 1.2,
                        team: [
                            [109, 37],
                            [42, 38],
                            [89, 39],
                            [49, 38],
                            [109, 37],
                            [110, 43]
                        ]
                    }]
                }, {
                    name: "Badge Marais",
                    region: "Safrania",
                    steps: [{
                        kind: "route",
                        name: "Piste Cyclable",
                        bg: "pier",
                        areas: ["kanto-route-16-area", "kanto-route-17-area", "kanto-route-18-area"],
                        wild: 4,
                        trainers: 2
                    }, {
                        kind: "heal",
                        name: "Céladopole",
                        bg: "town"
                    }, {
                        kind: "route",
                        name: "Repaire Rocket",
                        bg: "cave",
                        areas: ["kanto-route-7-area", "kanto-route-8-area"],
                        wild: 0,
                        trainers: 3,
                        item: !0
                    }, {
                        kind: "unlock",
                        name: "Repaire Rocket",
                        bg: "cave",
                        once: "silph-scope",
                        text: "Tu mets la main sur le Scope Sylphe : les Spectres de la Tour Pokémon ne pourront plus se cacher !"
                    }, {
                        kind: "route",
                        name: "Routes 7-8",
                        bg: "prairie",
                        areas: ["kanto-route-7-area", "kanto-route-8-area"],
                        wild: 4,
                        trainers: 1
                    }, {
                        kind: "heal",
                        name: "Safrania",
                        bg: "town"
                    }, {
                        kind: "gift",
                        name: "Dojo de Safrania",
                        bg: "town",
                        gift: {
                            key: "dojo",
                            choices: [106, 107],
                            level: 42,
                            text: "Le Maître Karaté t'offre un de ses Pokémon !"
                        }
                    }, {
                        kind: "route",
                        name: "Sylphe SARL",
                        bg: "town",
                        areas: ["saffron-city-silph-co-7f"],
                        wild: 0,
                        trainers: 3,
                        item: !0
                    }, {
                        kind: "find",
                        name: "Sylphe SARL 7e",
                        bg: "town",
                        item: "rare-candy",
                        once: "silph-rare-candy"
                    }, {
                        kind: "heal",
                        name: "Safrania",
                        bg: "town"
                    }, {
                        kind: "gym",
                        name: "Arène de Safrania",
                        bg: "gym-psychic",
                        fallback: "town",
                        leader: "Morgane",
                        sprite: "sabrina",
                        type: "psychic",
                        badge: "Marais",
                        color: "#f95587",
                        reward: 4257,
                        power: .79,
                        team: [
                            [64, 38],
                            [122, 37],
                            [97, 38],
                            [121, 38],
                            [49, 38],
                            [65, 43]
                        ]
                    }]
                }, {
                    name: "Badge Volcan",
                    region: "Routes maritimes → Cramois'Île",
                    steps: [{
                        kind: "route",
                        name: "Routes 19-20",
                        bg: "pier",
                        areas: ["kanto-sea-route-19-area", "kanto-sea-route-20-area"],
                        wild: 2,
                        trainers: 3
                    }, {
                        kind: "route",
                        name: "Centrale",
                        bg: "cave",
                        areas: ["kanto-power-plant-area"],
                        wild: 2,
                        trainers: 2
                    }, {
                        kind: "heal",
                        name: "Centrale",
                        bg: "cave"
                    }, {
                        kind: "route",
                        name: "Îles Écume",
                        bg: "cave",
                        climate: {
                            rain: 3,
                            storm: 1
                        },
                        areas: ["seafoam-islands-1f", "seafoam-islands-b1f", "seafoam-islands-b2f", "seafoam-islands-b3f", "seafoam-islands-b4f"],
                        wild: 3,
                        trainers: 3,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Cramois'Île",
                        bg: "beach"
                    }, {
                        kind: "trade",
                        name: "Labo de Cramois'Île",
                        bg: "beach",
                        level: 30,
                        text: "Le labo ranime ton fossile !",
                        offers: [
                            ["dome-fossil", 140],
                            ["helix-fossil", 138],
                            ["old-amber", 142]
                        ]
                    }, {
                        kind: "route",
                        name: "Manoir Pokémon",
                        bg: "cave",
                        areas: ["pokemon-mansion-1f", "pokemon-mansion-2f", "pokemon-mansion-3f", "pokemon-mansion-b1f"],
                        wild: 3,
                        trainers: 3,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Cramois'Île",
                        bg: "beach"
                    }, {
                        kind: "gym",
                        name: "Arène de Cramois'Île",
                        bg: "gym-fire",
                        fallback: "beach",
                        leader: "Auguste",
                        sprite: "blaine",
                        type: "fire",
                        badge: "Volcan",
                        color: "#ee8130",
                        reward: 4653,
                        power: 1.14,
                        team: [
                            [58, 42],
                            [77, 40],
                            [126, 43],
                            [38, 42],
                            [78, 42],
                            [59, 47]
                        ]
                    }]
                }, {
                    name: "Badge Terre",
                    region: "Route 21 → Jadielle",
                    steps: [{
                        kind: "route",
                        name: "Route 21",
                        bg: "pier",
                        areas: ["kanto-sea-route-21-area"],
                        wild: 3,
                        trainers: 3,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Bourg Palette",
                        bg: "town"
                    }, {
                        kind: "route",
                        name: "Route 1",
                        bg: "prairie",
                        areas: ["kanto-route-1-area"],
                        wild: 3,
                        trainers: 2
                    }, {
                        kind: "route",
                        name: "Forêt de Jade",
                        bg: "forest",
                        areas: ["viridian-forest-area"],
                        wild: 3,
                        trainers: 2,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Jadielle",
                        bg: "town"
                    }, {
                        kind: "route",
                        name: "Route 22",
                        bg: "prairie",
                        areas: ["kanto-route-22-area"],
                        wild: 3,
                        trainers: 1,
                        item: !0
                    }, {
                        kind: "heal",
                        name: "Jadielle",
                        bg: "town"
                    }, {
                        kind: "gym",
                        name: "Arène de Jadielle",
                        bg: "gym-ground",
                        fallback: "town",
                        leader: "Giovanni",
                        sprite: "giovanni",
                        type: "ground",
                        badge: "Terre",
                        color: "#e2bf65",
                        reward: 4950,
                        power: 1.27,
                        team: [
                            [111, 45],
                            [51, 42],
                            [53, 44],
                            [31, 44],
                            [34, 45],
                            [112, 50]
                        ]
                    }]
                }, {
                    name: "Route Victoire",
                    ace: 75,
                    region: "Route 23 → Route Victoire",
                    steps: [{
                        kind: "route",
                        name: "Route 23",
                        bg: "mountain",
                        areas: ["kanto-route-23-area"],
                        wild: 3,
                        trainers: 4,
                        classes: ["acetrainer", "acetrainer-f", "blackbelt", "psychic"]
                    }, {
                        kind: "heal",
                        name: "Route Victoire",
                        bg: "cave"
                    }, {
                        kind: "route",
                        name: "Route Victoire",
                        bg: "cave",
                        areas: ["kanto-victory-road-2-1f", "kanto-victory-road-2-2f", "kanto-victory-road-2-3f"],
                        wild: 3,
                        trainers: 5,
                        item: !0,
                        classes: ["acetrainer", "acetrainer-f", "blackbelt", "psychic"]
                    }, {
                        kind: "heal",
                        name: "Route Victoire",
                        bg: "cave"
                    }, {
                        kind: "gym",
                        name: "Route Victoire",
                        bg: "cave",
                        fallback: "mountain",
                        leader: "Blue",
                        sprite: "blue",
                        target: .45,
                        type: "normal",
                        badge: null,
                        color: "#5e83c4",
                        reward: 5e3,
                        text: "Blue t'attend à la sortie de la Route Victoire : un dernier combat avant la Ligue !",
                        power: 1.43,
                        team: [
                            [18, 47],
                            [65, 47],
                            [112, 45],
                            [103, 45],
                            [59, 45],
                            [9, 53]
                        ]
                    }]
                }, {
                    name: "Conseil 4 : Olga",
                    ace: 80,
                    league: !0,
                    region: "Plateau Indigo",
                    steps: [{
                        kind: "heal",
                        name: "Plateau Indigo",
                        bg: "mountain"
                    }, {
                        kind: "route",
                        name: "Salle",
                        bg: "gym-water",
                        fallback: "mountain",
                        areas: ["seafoam-islands-1f", "seafoam-islands-b1f", "seafoam-islands-b2f", "seafoam-islands-b3f", "seafoam-islands-b4f"],
                        wild: 0,
                        trainers: 4
                    }, {
                        kind: "gym",
                        name: "Salle 4",
                        bg: "gym-water",
                        fallback: "cave",
                        leader: "Olga",
                        sprite: "lorelei",
                        type: "ice",
                        badge: null,
                        color: "#96d9d6",
                        reward: 5544,
                        power: .36,
                        team: [
                            [87, 54],
                            [91, 53],
                            [73, 55],
                            [80, 54],
                            [124, 56],
                            [131, 56]
                        ]
                    }]
                }, {
                    name: "Conseil 4 : Aldo",
                    ace: 85,
                    league: !0,
                    region: "Plateau Indigo",
                    steps: [{
                        kind: "heal",
                        name: "Plateau Indigo",
                        bg: "mountain"
                    }, {
                        kind: "route",
                        name: "Salle",
                        bg: "gym-rock",
                        fallback: "mountain",
                        areas: ["digletts-cave-area", "kanto-victory-road-2-1f", "kanto-victory-road-2-2f", "kanto-victory-road-2-3f"],
                        wild: 0,
                        trainers: 4
                    }, {
                        kind: "gym",
                        name: "Salle 4",
                        bg: "gym-rock",
                        fallback: "mountain",
                        leader: "Aldo",
                        sprite: "bruno",
                        type: "fighting",
                        badge: null,
                        color: "#c22e28",
                        reward: 5742,
                        power: .48,
                        team: [
                            [95, 53],
                            [107, 55],
                            [57, 56],
                            [106, 55],
                            [95, 56],
                            [68, 58]
                        ]
                    }]
                }, {
                    name: "Conseil 4 : Agatha",
                    ace: 90,
                    league: !0,
                    region: "Plateau Indigo",
                    steps: [{
                        kind: "heal",
                        name: "Plateau Indigo",
                        bg: "mountain"
                    }, {
                        kind: "route",
                        name: "Salle",
                        bg: "gym-poison",
                        fallback: "mountain",
                        areas: ["pokemon-tower-3f", "pokemon-tower-4f", "pokemon-tower-5f", "pokemon-tower-6f", "pokemon-tower-7f", "pokemon-mansion-1f", "pokemon-mansion-b1f"],
                        wild: 0,
                        trainers: 4
                    }, {
                        kind: "gym",
                        name: "Salle 4",
                        bg: "gym-poison",
                        fallback: "cave",
                        leader: "Agatha",
                        sprite: "agatha",
                        type: "ghost",
                        badge: null,
                        color: "#735797",
                        reward: 5940,
                        power: .73,
                        team: [
                            [94, 56],
                            [42, 56],
                            [110, 56],
                            [93, 55],
                            [24, 58],
                            [94, 60]
                        ]
                    }]
                }, {
                    name: "Conseil 4 : Peter",
                    ace: 95,
                    league: !0,
                    region: "Plateau Indigo",
                    steps: [{
                        kind: "heal",
                        name: "Plateau Indigo",
                        bg: "mountain"
                    }, {
                        kind: "route",
                        name: "Salle",
                        bg: "gym-psychic",
                        fallback: "mountain",
                        areas: ["kanto-safari-zone-middle", "kanto-safari-zone-area-1-east", "kanto-safari-zone-area-2-north", "kanto-safari-zone-area-3-west", "kanto-sea-route-19-area", "kanto-sea-route-20-area"],
                        wild: 0,
                        trainers: 4
                    }, {
                        kind: "gym",
                        name: "Salle 4",
                        bg: "gym-psychic",
                        fallback: "mountain",
                        leader: "Peter",
                        target: .75,
                        sprite: "lance",
                        type: "dragon",
                        badge: null,
                        color: "#6f35fc",
                        reward: 6138,
                        power: .57,
                        team: [
                            [130, 58],
                            [148, 56],
                            [117, 58],
                            [148, 56],
                            [142, 60],
                            [149, 62]
                        ]
                    }]
                }, {
                    name: "Maître de la Ligue",
                    ace: 95,
                    capMargin: 5,
                    league: !0,
                    region: "Plateau Indigo",
                    steps: [{
                        kind: "heal",
                        name: "Plateau Indigo",
                        bg: "mountain"
                    }, {
                        kind: "route",
                        name: "Salle",
                        bg: "gym-psychic",
                        fallback: "mountain",
                        areas: ["kanto-route-22-area", "kanto-route-23-area", "kanto-victory-road-2-3f"],
                        wild: 0,
                        trainers: 4
                    }, {
                        kind: "gym",
                        name: "Salle 4",
                        bg: "gym-psychic",
                        fallback: "town",
                        leader: "Blue",
                        target: .45,
                        sprite: "blue",
                        type: "normal",
                        badge: "Maître",
                        champion: !0,
                        color: "#ffcb05",
                        reward: 9999,
                        power: 1.72,
                        team: [
                            [18, 59],
                            [65, 57],
                            [112, 59],
                            [103, 61],
                            [59, 61],
                            [9, 65]
                        ]
                    }]
                }, {
