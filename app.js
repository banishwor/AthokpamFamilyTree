// Family Tree Web Application - Static Viewer
class FamilyTreeApp {
    constructor() {
        // Layout constants
        this.layoutConfig = {
            nodeWidth: 150,       // horizontal slot per child
            childGap: 40,         // gap between sibling nodes
            coupleGap: 80,        // space between spouses
            familyGap: 80,        // extra padding around a family cluster
            levelHeight: 220,     // vertical distance between generations
            personRadius: 40
        };

        // Indexes for efficient lookup
        this.byId = {};
        this.couples = new Map();

        // Application state
        this.familyData = [];

        // Initialize the application
        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEvents();
        this.renderFamilyTree();
    }

    // Load Athokpam family data
    loadSampleData() {
        this.familyData = [
            // Root Generation (Generation 0) - Parents
            {
                "id": "shamu-athokpam",
                "name": "Shamu Athokpam", 
                "photo": "photos/shamu.jpg",
                "generation": 0,
                "parents": [],
                "spouse": "mangolnganbi-athokpam",
                "children": ["sanahal-athokpam", "radhamani-athokpam", "indu-athokpam", "sarat-athokpam", "basanta-athokpam", "tamphasana-athokpam"],
                "relationship": "Father"
            },
            {
                "id": "mangolnganbi-athokpam",
                "name": "Mangolnganbi Athokpam",
                "photo": "photos/mangolnganbi.jpg", 
                "generation": 0,
                "parents": [],
                "spouse": "shamu-athokpam",
                "children": ["sanahal-athokpam", "radhamani-athokpam", "indu-athokpam", "sarat-athokpam", "basanta-athokpam", "tamphasana-athokpam"],
                "relationship": "Mother"
            },
            
            // First Generation (Generation 1) - Children in Birth Order
            {
                "id": "sanahal-athokpam",
                "name": "Sanahal Athokpam",
                "photo": "photos/sanahal.jpg",
                "generation": 1, 
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"],
                "spouse": "mema-athokpam",
                "children": ["mithun-athokpam", "ranjita-athokpam", "luxmi-athokpam", "ibecha-athokpam"],
                "relationship": "Son (1st)"
            },
            {
                "id": "radhamani-athokpam",
                "name": "Radhamani Athokpam", 
                "photo": "photos/radhamani.jpg",
                "generation": 1,
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"],
                "spouse": "bino-athokpam", 
                "children": ["chaoba-athokpam", "omita-athokpam", "omila-athokpam", "ashalata-athokpam", "gojendro-athokpam"],
                "relationship": "Son (2nd)"
            },
            {
                "id": "indu-athokpam", 
                "name": "Indu Athokpam",
                "photo": "photos/indu.jpg",
                "generation": 1,
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"], 
                "spouse": "ngambi-athokpam",
                "children": ["jobistra-athokpam", "bandana-athokpam", "bandeshwori-athokpam", "reteshwori-athokpam"],
                "relationship": "Son (3rd)"
            },
            {
                "id": "sarat-athokpam",
                "name": "Sarat Athokpam",
                "photo": "photos/sarat.jpg",
                "generation": 1, 
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"],
                "spouse": "dimen-athokpam",
                "children": ["johnson-athokpam", "joykumar-athokpam", "joymati-athokpam"],
                "relationship": "Son (4th)"
            },
            {
                "id": "basanta-athokpam", 
                "name": "Basanta Athokpam",
                "photo": "photos/basanta.jpg",
                "generation": 1,
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"], 
                "spouse": "anita-athokpam",
                "children": ["banikanta-athokpam", "banishwor-athokpam", "bishwal-athokpam"],
                "relationship": "Son (6th)"
            },
            {
                "id": "tamphasana-athokpam",
                "name": "Tamphasana Athokpam",
                "photo": "photos/tamphasana.jpg",
                "generation": 1,
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Daughter (5th) - Married to different surname"
            },

            // Second Generation (Generation 2) - Sanahal's Family
            {
                "id": "mema-athokpam",
                "name": "Mema Athokpam",
                "photo": "photos/mema.jpg",
                "generation": 1,
                "parents": [],
                "spouse": "sanahal-athokpam",
                "children": ["mithun-athokpam", "ranjita-athokpam", "luxmi-athokpam", "ibecha-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "mithun-athokpam",
                "name": "Mithun Athokpam",
                "photo": "photos/mithun.jpg",
                "generation": 2,
                "parents": ["sanahal-athokpam", "mema-athokpam"],
                "spouse": "anjali-athokpam",
                "children": [],
                "relationship": "Grandson (1st)"
            },
            {
                "id": "ranjita-athokpam",
                "name": "Ranjita Athokpam",
                "photo": "photos/ranjita.jpg",
                "generation": 2,
                "parents": ["sanahal-athokpam", "mema-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter (2nd)"
            },
            {
                "id": "luxmi-athokpam",
                "name": "Luxmi Athokpam",
                "photo": "photos/luxmi.jpg",
                "generation": 2,
                "parents": ["sanahal-athokpam", "mema-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter (3rd)"
            },
            {
                "id": "ibecha-athokpam",
                "name": "Ibecha Athokpam",
                "photo": "photos/ibecha.jpg",
                "generation": 2,
                "parents": ["sanahal-athokpam", "mema-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter (4th)"
            },
            {
                "id": "anjali-athokpam",
                "name": "Anjali Athokpam",
                "photo": "photos/anjali.jpg",
                "generation": 2,
                "parents": [],
                "spouse": "mithun-athokpam",
                "children": [],
                "relationship": "Daughter-in-law"
            },



            // Second Generation (Generation 2) - Inao's Family
            {
                "id": "bino-athokpam",
                "name": "Bino Athokpam",
                "photo": "photos/bino.jpg",
                "generation": 1, 
                "parents": [],
                "spouse": "radhamani-athokpam",
                "children": ["chaoba-athokpam", "omita-athokpam", "omila-athokpam", "ashalata-athokpam", "gojendro-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "chaoba-athokpam",
                "name": "Chaoba Athokpam",
                "photo": "photos/chaoba.jpg",
                "generation": 2,
                "parents": ["radhamani-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "omita-athokpam",
                "name": "Omita Athokpam",
                "photo": "photos/omita.jpg",
                "generation": 2,
                "parents": ["radhamani-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "omila-athokpam",
                "name": "Omila Athokpam",
                "photo": "photos/omila.jpg",
                "generation": 2,
                "parents": ["radhamani-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "ashalata-athokpam",
                "name": "Ashalata Athokpam",
                "photo": "photos/ashalata.jpg",
                "generation": 2,
                "parents": ["radhamani-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "gojendro-athokpam",
                "name": "Gojendro Athokpam",
                "photo": "photos/gojendro.jpg",
                "generation": 2,
                "parents": ["radhamani-athokpam", "bino-athokpam"],
                "spouse": "promila-athokpam",
                "children": ["athoiba-athokpam"],
                "relationship": "Grandson"
            },
            // Second Generation (Generation 2) - Indu's Family
            {
                "id": "ngambi-athokpam",
                "name": "Ngambi Athokpam",
                "photo": "photos/ngambi.jpg",
                "generation": 1,
                "parents": [],
                "spouse": "indu-athokpam",
                "children": ["jobistra-athokpam", "bandana-athokpam", "bandeshwori-athokpam", "reteshwori-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "jobistra-athokpam",
                "name": "Jobistra Athokpam",
                "photo": "photos/jobistra.jpg",
                "generation": 2,
                "parents": ["indu-athokpam", "ngambi-athokpam"],
                "spouse": "romita-athokpam",
                "children": ["lamjingbi-athokpam"],
                "relationship": "Grandson"
            },
            {
                "id": "bandana-athokpam",
                "name": "Bandana Athokpam",
                "photo": "photos/bandana.jpg",
                "generation": 2,
                "parents": ["indu-athokpam", "ngambi-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "bandeshwori-athokpam",
                "name": "Bandeshwori Athokpam",
                "photo": "photos/bandeshwori.jpg",
                "generation": 2,
                "parents": ["indu-athokpam", "ngambi-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "reteshwori-athokpam",
                "name": "Reteshwori Athokpam",
                "photo": "photos/reteshwori.jpg",
                "generation": 2,
                "parents": ["indu-athokpam", "ngambi-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "romita-athokpam",
                "name": "Romita Athokpam",
                "photo": "photos/romita.jpg",
                "generation": 2,
                "parents": [],
                "spouse": "jobistra-athokpam",
                "children": ["lamjingbi-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "promila-athokpam",
                "name": "Promila Athokpam",
                "photo": "photos/promila.jpg",
                "generation": 2,
                "parents": [],
                "spouse": "gojendro-athokpam",
                "children": ["athoiba-athokpam"],
                "relationship": "Daughter-in-law"
            },
            
            // Second Generation (Generation 2) - Sarat's Family
            {
                "id": "dimen-athokpam",
                "name": "Dimen Athokpam",
                "photo": "photos/dimen.jpg",
                "generation": 1,
                "parents": [],
                "spouse": "sarat-athokpam",
                "children": ["johnson-athokpam", "joykumar-athokpam", "joymati-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "johnson-athokpam",
                "name": "Johnson Athokpam",
                "photo": "photos/johnson.jpg",
                "generation": 2,
                "parents": ["sarat-athokpam", "dimen-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Grandson"
            },
            {
                "id": "joykumar-athokpam",
                "name": "Joykumar Athokpam",
                "photo": "photos/joykumar.jpg",
                "generation": 2,
                "parents": ["sarat-athokpam", "dimen-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Grandson"
            },
            {
                "id": "joymati-athokpam",
                "name": "Joymati Athokpam",
                "photo": "photos/joymati.jpg",
                "generation": 2,
                "parents": ["sarat-athokpam", "dimen-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },

            // Second Generation (Generation 2) - Basanta's Family
            {
                "id": "anita-athokpam",
                "name": "Anita Athokpam",
                "photo": "photos/anita.jpg",
                "generation": 1,
                "parents": [],
                "spouse": "basanta-athokpam",
                "children": ["banikanta-athokpam", "banishwor-athokpam", "bishwal-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "banikanta-athokpam",
                "name": "Banikanta Athokpam",
                "photo": "photos/banikanta.jpg",
                "generation": 2,
                "parents": ["basanta-athokpam", "anita-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Grandson"
            },
            {
                "id": "banishwor-athokpam",
                "name": "Banishwor Athokpam",
                "photo": "photos/banishwor.jpg",
                "generation": 2,
                "parents": ["basanta-athokpam", "anita-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Grandson"
            },
            {
                "id": "bishwal-athokpam",
                "name": "Bishwal Athokpam",
                "photo": "photos/bishwal.jpg",
                "generation": 2,
                "parents": ["basanta-athokpam", "anita-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Grandson"
            },

            // Third Generation (Generation 3) - Great-grandchildren
            {
                "id": "lamjingbi-athokpam",
                "name": "Lamjingbi Athokpam",
                "photo": "photos/lamjingbi.jpg",
                "generation": 3,
                "parents": ["jobistra-athokpam", "romita-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Great-granddaughter"
            },
            {
                "id": "athoiba-athokpam",
                "name": "Athoiba Athokpam",
                "photo": "photos/athoiba.jpg",
                "generation": 3,
                "parents": ["gojendro-athokpam", "promila-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Great-grandson"
            }
        ];
    }

    // Event binding
    bindEvents() {
        // Profile modal close
        const closeProfileModal = document.getElementById('closeProfileModal');
        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', () => this.hideProfileModal());
        }

        // Close modal on overlay click
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        modalOverlays.forEach(overlay => {
            overlay.addEventListener('click', () => this.hideAllModals());
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // 1) Identify couples (spouse pairs) and index persons
    buildIndexes() {
        this.byId = {};
        this.familyData.forEach(p => this.byId[p.id] = p);

        // Normalize couples as id1-id2 with sorted ids to get a stable key
        this.couples = new Map(); // key => {id1, id2, children:[], gen}
        for (const p of this.familyData) {
            if (p.spouse) {
                const a = p.id, b = p.spouse;
                const [id1, id2] = a < b ? [a,b] : [b,a];
                const key = `${id1}__${id2}`;
                if (!this.couples.has(key)) {
                    // Use the lower generation of the two as the couple generation
                    const gen = Math.min(this.byId[id1]?.generation ?? 0, this.byId[id2]?.generation ?? 0);
                    this.couples.set(key, { key, id1, id2, children: [], gen });
                }
            }
        }

        // Attach children to their parents' couple
        for (const [key, couple] of this.couples) {
            const { id1, id2 } = couple;
            const p1 = this.byId[id1];
            if (p1 && Array.isArray(p1.children)) {
                // Either parent may host the children list; we unify them here
                couple.children = p1.children.slice();
            }
        }
    }

    // 2) Build a forest of family trees starting from root couples (generation 0 -> 1 -> 2, etc.)
    buildFamilyForest() {
        // Root couples: couples whose parents are empty (or gen==0), i.e., Shamu + Mangolnganbi
        const roots = [];
        for (const couple of this.couples.values()) {
            const p1 = this.byId[couple.id1];
            const p2 = this.byId[couple.id2];
            const bothParentsEmpty = (p1?.parents?.length ?? 0) === 0 && (p2?.parents?.length ?? 0) === 0;
            const gen0 = (p1?.generation ?? 99) === 0 || (p2?.generation ?? 99) === 0;
            if (bothParentsEmpty || gen0) {
                roots.push(couple);
            }
        }
        // Fallback: if no gen0 couple found, pick any couple with the lowest generation
        if (roots.length === 0) {
            let minGen = Infinity, candidate = null;
            for (const c of this.couples.values()) {
                if (c.gen < minGen) { minGen = c.gen; candidate = c; }
            }
            if (candidate) roots.push(candidate);
        }
        return roots;
    }

    // 3) For each person child, find their eventual couple (if they have a spouse). This creates the recursion.
    findCoupleOfPerson(personId) {
        const p = this.byId[personId];
        if (!p || !p.spouse) return null;
        const [id1, id2] = personId < p.spouse ? [personId, p.spouse] : [p.spouse, personId];
        const key = `${id1}__${id2}`;
        return this.couples.get(key) || null;
    }

    // Layout constants
    getLayoutConfig() {
        return this.layoutConfig;
    }

    // Compute the horizontal width of a couple subtree
    computeSubtreeWidth(couple) {
        const cfg = this.getLayoutConfig();
        if (!couple) return cfg.nodeWidth;

        // If no children, minimal width is the couple width
        const coupleWidth = cfg.nodeWidth + cfg.coupleGap + cfg.nodeWidth;

        if (!couple.children || couple.children.length === 0) {
            return Math.max(coupleWidth, cfg.nodeWidth);
        }

        // For each child, if the child forms a couple later, use that subtree width; else 1 slot.
        const childWidths = couple.children.map(childId => {
            const childCouple = this.findCoupleOfPerson(childId);
            return childCouple ? this.computeSubtreeWidth(childCouple) : cfg.nodeWidth;
        });

        // Total children row width
        const childrenWidth = childWidths.reduce((a,b) => a + b, 0) + cfg.childGap * Math.max(0, childWidths.length - 1);

        // Subtree width is max of couple line width and children row width (+ some family padding)
        return Math.max(coupleWidth, childrenWidth) + cfg.familyGap;
    }

    // Assign x,y positions: center children under parents; return centerX of this subtree
    assignPositionsForCouple(couple, topY, centerX, positions) {
        const cfg = this.getLayoutConfig();

        // Determine who is husband and who is wife
        const person1 = this.byId[couple.id1];
        const person2 = this.byId[couple.id2];
        
        const isPerson1Male = person1?.relationship.includes('Son') || 
                             person1?.relationship.includes('Father') || 
                             person1?.relationship.includes('Grandson');
        
        let husbandId, wifeId;
        if (isPerson1Male) {
            husbandId = couple.id1;
            wifeId = couple.id2;
        } else {
            husbandId = couple.id2;
            wifeId = couple.id1;
        }

        // Place spouses around centerX - husband always on left, wife always on right
        const husbandX = centerX - (cfg.coupleGap/2 + cfg.nodeWidth/2);
        const wifeX    = centerX + (cfg.coupleGap/2 + cfg.nodeWidth/2);

        // Persist positions for both persons
        positions[husbandId] = { x: husbandX, y: topY, generation: this.byId[husbandId]?.generation ?? 0 };
        positions[wifeId] = { x: wifeX, y: topY, generation: this.byId[wifeId]?.generation ?? 0 };

        // Children row
        if (!couple.children || couple.children.length === 0) return centerX;

        const childY = topY + cfg.levelHeight;

        // Compute widths to place children centered under centerX
        const childSubtreeWidths = couple.children.map(childId => {
            const cc = this.findCoupleOfPerson(childId);
            return cc ? this.computeSubtreeWidth(cc) : cfg.nodeWidth;
        });
        const totalChildrenWidth = childSubtreeWidths.reduce((a,b) => a + b, 0) + cfg.childGap * Math.max(0, childSubtreeWidths.length - 1);

        // Leftmost start so that the children row is centered to centerX
        let cursorX = centerX - totalChildrenWidth / 2;

        couple.children.forEach((childId, idx) => {
            const cc = this.findCoupleOfPerson(childId);
            const boxWidth = childSubtreeWidths[idx];

            // Place the child person node at the box center
            const childCenter = cursorX + boxWidth / 2;
            positions[childId] = { x: childCenter, y: childY, generation: (this.byId[childId]?.generation ?? 0) };

            // Recurse for child couple, if exists
            if (cc) {
                this.assignPositionsForCouple(cc, childY, childCenter, positions);
            }

            cursorX += boxWidth + cfg.childGap;
        });

        return centerX;
    }

    // Family tree rendering - New hierarchical layout
    renderFamilyTree() {
        const svg = document.getElementById('familyTreeSvg');
        if (!svg) return;
        svg.innerHTML = '';

        // Canvas
        const width = 2400, height = 2000;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // 1) Build indices and couples
        this.buildIndexes();
        const roots = this.buildFamilyForest();

        // 2) Compute total width of all root subtrees, place them centered
        const cfg = this.getLayoutConfig();
        const rootY = 150;
        const rootWidths = roots.map(r => this.computeSubtreeWidth(r));
        const totalWidth = rootWidths.reduce((a,b) => a + b, 0) + cfg.familyGap * Math.max(0, roots.length - 1);
        let cursorX = (width - totalWidth) / 2;

        // 3) Assign positions
        const positions = {};
        roots.forEach((rootCouple, i) => {
            const w = rootWidths[i];
            const centerX = cursorX + w/2;
            this.assignPositionsForCouple(rootCouple, rootY, centerX, positions);
            cursorX += w + cfg.familyGap;
        });

        // 4) Draw edges: spouse line and parent->child mostly straight
        this.drawFamilyEdges(svg, positions);

        // 5) Draw nodes
        this.familyData.forEach(p => {
            const pos = positions[p.id];
            if (pos) this.drawFamilyNode(svg, p, pos);
        });

        // 6) Zoom/pan
        this.addZoomPanFunctionality(svg);
    }

        // Arrange family members so wives are always on the right of their husbands
    arrangeSpouses(members) {
        const arranged = [];
        const processed = new Set();
        
        // For generation 2 (children), try to group by families
        if (members.length > 0 && members[0].generation === 2) {
            return this.arrangeChildrenByFamilies(members);
        }
        
        members.forEach(person => {
            if (processed.has(person.id)) return;
            
            // If this person has a spouse
            if (person.spouse) {
                const spouse = members.find(m => m.id === person.spouse);
                if (spouse && !processed.has(spouse.id)) {
                    // Determine who is husband and who is wife based on relationship
                    const isPersonMale = person.relationship.includes('Son') || 
                                        person.relationship.includes('Father') || 
                                        person.relationship.includes('Grandson');
                    
                    if (isPersonMale) {
                        // Person is male (husband), spouse is female (wife)
                        arranged.push(person);      // Husband on left
                        arranged.push(spouse);      // Wife on right
                    } else {
                        // Person is female (wife), spouse is male (husband)
                        arranged.push(spouse);      // Husband on left
                        arranged.push(person);      // Wife on right
                    }
                    
                    processed.add(person.id);
                    processed.add(spouse.id);
                }
            } else {
                // No spouse, add individually
                arranged.push(person);
                processed.add(person.id);
            }
        });
        
        return arranged;
    }

    // Arrange children by their families for better grouping
    arrangeChildrenByFamilies(children) {
        const families = {};
        
        // Group children by their parents
        children.forEach(child => {
            if (child.parents && child.parents.length === 2) {
                const parentKey = child.parents.sort().join('-');
                if (!families[parentKey]) {
                    families[parentKey] = [];
                }
                families[parentKey].push(child);
            }
        });
        
        // Arrange families in order and flatten
        const arranged = [];
        Object.keys(families).forEach(parentKey => {
            families[parentKey].forEach(child => {
                arranged.push(child);
            });
        });
        
        return arranged;
    }

    addZoomPanFunctionality(svg) {
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let endPoint = { x: 0, y: 0 };
        let viewBox = { x: 0, y: 0, width: 2400, height: 2000 };
        let initialDistance = 0;
        let initialViewBox = null;

        // Enhanced mouse wheel zoom with dynamic spacing
        svg.addEventListener('wheel', (e) => {
        e.preventDefault();
            const zoomIntensity = 0.1;
            const zoom = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
            
            // Get mouse position relative to SVG
            const rect = svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Convert to SVG coordinates
            const svgPoint = svg.createSVGPoint();
            svgPoint.x = mouseX;
            svgPoint.y = mouseY;
            const ctm = svg.getScreenCTM().inverse();
            const point = svgPoint.matrixTransform(ctm);
            
            // Calculate new viewBox
            const newWidth = viewBox.width / zoom;
            const newHeight = viewBox.height / zoom;
            const newX = point.x - (point.x - viewBox.x) / zoom;
            const newY = point.y - (point.y - viewBox.y) / zoom;
            
            viewBox = { x: newX, y: newY, width: newWidth, height: newHeight };
            svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
            
            // Update dynamic spacing based on zoom level
            this.updateDynamicSpacing(zoom);
        });

        // Pan functionality (Mouse)
        svg.addEventListener('mousedown', (e) => {
            isPanning = true;
            startPoint = { x: e.clientX, y: e.clientY };
            svg.style.cursor = 'grabbing';
        });

        svg.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            
            endPoint = { x: e.clientX, y: e.clientY };
            const dx = (startPoint.x - endPoint.x) * viewBox.width / svg.clientWidth;
            const dy = (startPoint.y - endPoint.y) * viewBox.height / svg.clientHeight;
            
            viewBox.x += dx;
            viewBox.y += dy;
            svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
            
            startPoint = { x: endPoint.x, y: endPoint.y };
        });

        svg.addEventListener('mouseup', () => {
            isPanning = false;
            svg.style.cursor = 'grab';
        });

        svg.addEventListener('mouseleave', () => {
            isPanning = false;
            svg.style.cursor = 'grab';
        });

        // Touch functionality for mobile devices
        svg.addEventListener('touchstart', (e) => {
            // Only prevent default if we're not touching a family node
            const target = e.target;
            if (target.closest('g[data-person-id]')) {
                // Don't prevent default for family nodes - let them handle their own touch events
                return;
            }
            
            e.preventDefault();
            
            if (e.touches.length === 1) {
                // Single touch - start panning
                isPanning = true;
                startPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                initialViewBox = { ...viewBox };
            } else if (e.touches.length === 2) {
                // Two touches - prepare for pinch zoom
                isPanning = false;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                initialViewBox = { ...viewBox };
            }
        }, { passive: false });

        svg.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && isPanning) {
                // Single touch panning
                const touch = e.touches[0];
                endPoint = { x: touch.clientX, y: touch.clientY };
                const dx = (startPoint.x - endPoint.x) * viewBox.width / svg.clientWidth;
                const dy = (startPoint.y - endPoint.y) * viewBox.height / svg.clientHeight;
                
                viewBox.x += dx;
                viewBox.y += dy;
                svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
                
                startPoint = { x: endPoint.x, y: endPoint.y };
            } else if (e.touches.length === 2 && initialViewBox) {
                // Two touch pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                if (initialDistance > 0) {
                    const scale = currentDistance / initialDistance;
                    const zoom = scale; // Fixed: removed the 1/scale inversion
                    
                    // Calculate center point between the two touches
                    const centerX = (touch1.clientX + touch2.clientX) / 2;
                    const centerY = (touch1.clientY + touch2.clientY) / 2;
                    
                    // Convert to SVG coordinates
                    const rect = svg.getBoundingClientRect();
                    const svgPoint = svg.createSVGPoint();
                    svgPoint.x = centerX - rect.left;
                    svgPoint.y = centerY - rect.top;
                    const ctm = svg.getScreenCTM().inverse();
                    const point = svgPoint.matrixTransform(ctm);
                    
                    // Calculate new viewBox
                    const newWidth = initialViewBox.width / scale; // Fixed: use division for correct zoom
                    const newHeight = initialViewBox.height / scale; // Fixed: use division for correct zoom
                    const newX = point.x - (point.x - initialViewBox.x) / scale; // Fixed: use division
                    const newY = point.y - (point.y - initialViewBox.y) / scale; // Fixed: use division
                    
                    viewBox = { x: newX, y: newY, width: newWidth, height: newHeight };
                    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
                    
                    // Update dynamic spacing based on zoom level
                    this.updateDynamicSpacing(zoom);
                }
            }
        }, { passive: false });

        svg.addEventListener('touchend', (e) => {
            e.preventDefault();
            isPanning = false;
            initialDistance = 0;
            initialViewBox = null;
        }, { passive: false });

        // Prevent default touch behaviors that might interfere
        svg.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            isPanning = false;
            initialDistance = 0;
            initialViewBox = null;
        }, { passive: false });

        // Set initial cursor
        svg.style.cursor = 'grab';
    }

    // Update dynamic spacing based on zoom level
    updateDynamicSpacing(zoomLevel) {
        const connections = document.querySelectorAll('.tree-connection');
        const labels = document.querySelectorAll('text[data-child-id]');
        
        connections.forEach(connection => {
            const childId = connection.getAttribute('data-child-id');
            const child = this.familyData.find(p => p.id === childId);
            
            if (child) {
                // Adjust stroke width based on zoom
                const strokeWidth = Math.max(1, Math.min(5, 2 * zoomLevel));
                connection.setAttribute('stroke-width', strokeWidth);
                
                // Adjust curve intensity based on zoom
                this.updateConnectionCurve(connection, childId, zoomLevel);
            }
        });
        
        labels.forEach(label => {
            // Adjust font size based on zoom
            const fontSize = Math.max(8, Math.min(20, 12 * zoomLevel));
            label.setAttribute('font-size', fontSize);
        });
    }

    // Update connection curve based on zoom level
    updateConnectionCurve(connection, childId, zoomLevel) {
        // This will be called to adjust curve intensity based on zoom
        // For now, we'll keep the basic curve, but this can be enhanced
        // to create more separation at higher zoom levels
    }

        // Position parent generations (0 and 1) with standard arrangement
    positionParentGeneration(positions, members, y, generation) {
        const arrangedMembers = this.arrangeSpouses(members);
        const baseSpacing = 150;
        const spouseSpacing = 80;
        
        let currentX = 0;
        let totalWidth = 0;
        
        // Calculate total width
        for (let i = 0; i < arrangedMembers.length; i++) {
            const member = arrangedMembers[i];
            const nextMember = arrangedMembers[i + 1];
            
            totalWidth += nodeWidth;
            
            if (nextMember && member.spouse === nextMember.id) {
                totalWidth += spouseSpacing;
                i++;
                totalWidth += nodeWidth;
                if (i < arrangedMembers.length - 1) {
                    totalWidth += baseSpacing;
                }
            } else if (i < arrangedMembers.length - 1) {
                totalWidth += baseSpacing;
            }
        }
        
        const startX = (width - totalWidth) / 2;
        currentX = startX;

        // Position members
        for (let i = 0; i < arrangedMembers.length; i++) {
            const member = arrangedMembers[i];
            const nextMember = arrangedMembers[i + 1];
            
            positions[member.id] = {
                x: currentX + nodeWidth / 2,
                y: y,
                generation: generation
            };
            
            currentX += nodeWidth;
            
            if (nextMember && member.spouse === nextMember.id) {
                currentX += spouseSpacing;
                i++;
                positions[nextMember.id] = {
                    x: currentX + nodeWidth / 2,
                    y: y,
                    generation: generation
                };
                currentX += nodeWidth;
                if (i < arrangedMembers.length - 1) {
                    currentX += baseSpacing;
                }
            } else if (i < arrangedMembers.length - 1) {
                currentX += baseSpacing;
            }
        }
    }

    // Position child generations with family-centered layout
    positionChildGeneration(positions, children, y, generation) {
        // Group children by their parents
        const childrenByParents = {};
        
        children.forEach(child => {
            if (child.parents && child.parents.length === 2) {
                const parentKey = child.parents.sort().join('-');
                if (!childrenByParents[parentKey]) {
                    childrenByParents[parentKey] = [];
                }
                childrenByParents[parentKey].push(child);
            }
        });

        // Get parent positions to calculate family centers
        const familyCenters = {};
        Object.keys(childrenByParents).forEach(parentKey => {
            const parentIds = parentKey.split('-');
            const parent1 = this.familyData.find(p => p.id === parentIds[0]);
            const parent2 = this.familyData.find(p => p.id === parentIds[1]);
            
            if (parent1 && parent2 && positions[parent1.id] && positions[parent2.id]) {
                familyCenters[parentKey] = (positions[parent1.id].x + positions[parent2.id].x) / 2;
            }
        });

        // Calculate total width needed for all families
        let totalWidth = 0;
        const familySpacing = 200; // Space between different families
        
        Object.keys(childrenByParents).forEach((parentKey, index) => {
            const childrenInFamily = childrenByParents[parentKey];
            const familyWidth = childrenInFamily.length * nodeWidth + (childrenInFamily.length - 1) * 40;
            totalWidth += familyWidth;
            if (index < Object.keys(childrenByParents).length - 1) {
                totalWidth += familySpacing;
            }
        });

        // Position families starting from center
        const startX = (width - totalWidth) / 2;
        let currentX = startX;

        Object.keys(childrenByParents).forEach(parentKey => {
            const childrenInFamily = childrenByParents[parentKey];
            
            // Calculate width for this family
            const familyWidth = childrenInFamily.length * nodeWidth + (childrenInFamily.length - 1) * 40;
            
            // Position children in this family
            childrenInFamily.forEach((child, index) => {
                const childX = currentX + index * (nodeWidth + 40) + nodeWidth / 2;
                positions[child.id] = {
                    x: childX,
                    y: y,
                    generation: generation
                };
            });
            
            currentX += familyWidth + familySpacing;
        });
    }

    drawFamilyEdges(svg, positions) {
        // spouse lines
        for (const couple of this.couples.values()) {
            // Determine husband and wife positions
            const person1 = this.byId[couple.id1];
            const person2 = this.byId[couple.id2];
            
            const isPerson1Male = person1?.relationship.includes('Son') || 
                                 person1?.relationship.includes('Father') || 
                                 person1?.relationship.includes('Grandson');
            
            let husbandId, wifeId;
            if (isPerson1Male) {
                husbandId = couple.id1;
                wifeId = couple.id2;
            } else {
                husbandId = couple.id2;
                wifeId = couple.id1;
            }

            const husbandPos = positions[husbandId];
            const wifePos = positions[wifeId];
            if (!husbandPos || !wifePos) continue;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', husbandPos.x);
            line.setAttribute('y1', husbandPos.y);
            line.setAttribute('x2', wifePos.x);
            line.setAttribute('y2', wifePos.y);
            line.setAttribute('stroke', '#666');
            line.setAttribute('stroke-width', '3');
            svg.appendChild(line);

            // vertical drop from middle of couple for children
            const midX = (husbandPos.x + wifePos.x) / 2;
            if (couple.children && couple.children.length) {
                // small vertical hub then straight to each child
                const hubY = husbandPos.y + 40;
                const hub = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                hub.setAttribute('x1', midX);
                hub.setAttribute('y1', husbandPos.y);
                hub.setAttribute('x2', midX);
                hub.setAttribute('y2', hubY);
                hub.setAttribute('stroke', '#666');
                hub.setAttribute('stroke-width', '2');
                svg.appendChild(hub);

                couple.children.forEach(childId => {
                    const cpos = positions[childId];
                    if (!cpos) return;

                    // Mostly straight-line: down from hub then slight diagonal or straight to above child
                    const v = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    v.setAttribute('x1', midX);
                    v.setAttribute('y1', hubY);
                    v.setAttribute('x2', cpos.x);
                    v.setAttribute('y2', cpos.y - 40);
                    v.setAttribute('stroke', '#666');
                    v.setAttribute('stroke-width', '2');
                    v.classList.add('tree-connection');
                    v.setAttribute('data-child-id', childId);
                    svg.appendChild(v);

                    // Add relationship label (Son/Daughter) in the middle of the line
                    const midLineX = (midX + cpos.x) / 2;
                    const midLineY = (hubY + cpos.y - 40) / 2;
                    
                    // Determine if child is son or daughter from relationship field
                    const child = this.familyData.find(p => p.id === childId);
                    const relationshipLabel = this.getRelationshipLabel(child);
                    
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', midLineX);
                    label.setAttribute('y', midLineY - 5);
                    label.setAttribute('text-anchor', 'middle');
                    label.setAttribute('font-family', 'Arial, sans-serif');
                    label.setAttribute('font-size', '12');
                    label.setAttribute('font-weight', 'bold');
                    label.setAttribute('fill', '#333');
                    label.setAttribute('stroke', 'white');
                    label.setAttribute('stroke-width', '3');
                    label.setAttribute('paint-order', 'stroke');
                    label.textContent = relationshipLabel;
                    svg.appendChild(label);
                });
            }
        }
    }

    drawTraditionalConnections(svg, positions) {
        // Add arrow marker definition for double-headed arrows
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#666');
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Draw horizontal lines for spouses
        this.familyData.forEach(person => {
            if (person.spouse && person.id < person.spouse) {
                const spouse = this.familyData.find(p => p.id === person.spouse);
                if (spouse && positions[person.id] && positions[person.spouse]) {
                    const pos1 = positions[person.id];
                    const pos2 = positions[person.spouse];
                    
                    // Horizontal line connecting spouses
                    const spouseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    spouseLine.setAttribute('x1', pos1.x);
                    spouseLine.setAttribute('y1', pos1.y);
                    spouseLine.setAttribute('x2', pos2.x);
                    spouseLine.setAttribute('y2', pos2.y);
                    spouseLine.setAttribute('stroke', '#666');
                    spouseLine.setAttribute('stroke-width', '3');
                    svg.appendChild(spouseLine);
                }
            }
        });

        // Draw parent-child connections from the middle of husband-wife pairs
        const parentChildConnections = this.getParentChildConnections();
        
        parentChildConnections.forEach((connection, connectionIndex) => {
            const { parentPair, children } = connection;
            
            // Calculate the middle point of the parent pair
            const parent1 = this.familyData.find(p => p.id === parentPair[0]);
            const parent2 = this.familyData.find(p => p.id === parentPair[1]);
            
            if (parent1 && parent2 && positions[parent1.id] && positions[parent2.id]) {
                const parentMiddleX = (positions[parent1.id].x + positions[parent2.id].x) / 2;
                const parentMiddleY = positions[parent1.id].y;
                
                // Draw line from parent middle to each child with family-specific routing
                children.forEach((childId, childIndex) => {
                    const child = this.familyData.find(p => p.id === childId);
                    if (child && positions[childId]) {
                        // Create dynamic curved path with proper label positioning
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        const startY = parentMiddleY + 40; // Start below parent node
                        const endY = positions[childId].y - 40; // End above child node
                        
                        // Simple straight or slightly curved path since children are centered under parents
                        const horizontalDistance = positions[childId].x - parentMiddleX;
                        const verticalDistance = endY - startY;
                        
                        // If child is directly under parent, use straight line
                        let pathData;
                        if (Math.abs(horizontalDistance) < 100) {
                            pathData = `M ${parentMiddleX} ${startY} L ${positions[childId].x} ${endY}`;
                        } else {
                            // If child is offset, use slight curve
                            const controlX = parentMiddleX + horizontalDistance * 0.3;
                            const controlY = startY + verticalDistance * 0.5;
                            pathData = `M ${parentMiddleX} ${startY} Q ${controlX} ${controlY} ${positions[childId].x} ${endY}`;
                        }
                        path.setAttribute('d', pathData);
                        path.setAttribute('stroke', '#666');
                        path.setAttribute('stroke-width', '2');
                        path.setAttribute('fill', 'none');
                        path.setAttribute('marker-end', 'url(#arrowhead)');
                        path.setAttribute('marker-start', 'url(#arrowhead)');
                        path.classList.add('tree-connection');
                        path.setAttribute('data-child-id', childId); // For interactive features
                        svg.appendChild(path);

                        // Add relationship label positioned correctly on the curve
                        const relationshipLabel = this.getRelationshipLabel(child);
                        this.addLabelOnCurve(svg, pathData, relationshipLabel, childId);
                    }
                });
            }
        });
    }

    // Get parent-child connections organized by parent pairs
    getParentChildConnections() {
        const connections = [];
        
        // Look for parent pairs who have children
        this.familyData.forEach(person => {
            if (person.children && person.children.length > 0 && person.spouse) {
                const spouse = this.familyData.find(p => p.id === person.spouse);
                if (spouse) {
                    // Only add once per couple (avoid duplicates)
                    if (person.id < spouse.id) {
                        connections.push({
                            parentPair: [person.id, spouse.id],
                            children: person.children
                        });
                    }
                }
            }
        });
        
        return connections;
    }

    // Get relationship label (Son/Daughter) from person's relationship field
    getRelationshipLabel(person) {
        if (person.relationship.includes('Son') || person.relationship.includes('Grandson') || person.relationship.includes('Great-grandson')) {
            return 'Son';
        } else if (person.relationship.includes('Daughter') || person.relationship.includes('Granddaughter') || person.relationship.includes('Great-granddaughter')) {
            return 'Daughter';
        }
        return 'Child'; // Fallback
    }

    // Add label positioned correctly on a curved path
    addLabelOnCurve(svg, pathData, labelText, childId) {
        // Create a temporary path element to calculate the point at 50% along the curve
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('d', pathData);
        
        // Get the point at 50% along the path
        const pathLength = tempPath.getTotalLength();
        const midPoint = tempPath.getPointAtLength(pathLength * 0.5);
        
        // Create text element with textPath for proper curve following
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#333');
        text.setAttribute('stroke', 'white');
        text.setAttribute('stroke-width', '3');
        text.setAttribute('paint-order', 'stroke');
        text.setAttribute('data-child-id', childId);
        
        // Create textPath element to follow the curve
        const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
        textPath.setAttribute('href', `#path-${childId}`);
        textPath.setAttribute('startOffset', '50%');
        textPath.setAttribute('text-anchor', 'middle');
        textPath.textContent = labelText;
        
        text.appendChild(textPath);
        svg.appendChild(text);
        
        // Create the referenced path (hidden)
        const refPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        refPath.setAttribute('id', `path-${childId}`);
        refPath.setAttribute('d', pathData);
        refPath.setAttribute('visibility', 'hidden');
        svg.appendChild(refPath);
    }

    drawFamilyNode(svg, person, position) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('tree-node');
        group.setAttribute('tabindex', '0');
        group.setAttribute('role', 'button');
        group.setAttribute('aria-label', `View ${person.name}'s profile`);
        group.setAttribute('data-person-id', person.id);

        // Node circle with better styling
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', position.x);
        circle.setAttribute('cy', position.y);
        circle.setAttribute('r', 40);
        circle.classList.add('tree-node-circle');
        circle.classList.add(`generation-${person.generation}`);
        circle.setAttribute('stroke', 'none');
        circle.setAttribute('stroke-width', '0');
        circle.setAttribute('fill', this.getGenerationColor(person.generation));

        group.appendChild(circle);

        // Handle photo or initials
        if (person.photo && person.photo !== null) {
            // Create a foreignObject to embed HTML for better image handling
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            foreignObject.setAttribute('x', position.x - 35);
            foreignObject.setAttribute('y', position.y - 35);
            foreignObject.setAttribute('width', '70');
            foreignObject.setAttribute('height', '70');
            
                         // Create HTML div for the image
             const div = document.createElement('div');
             div.style.width = '100%';
             div.style.height = '100%';
             div.style.borderRadius = '50%';
             div.style.overflow = 'hidden';
             div.style.display = 'flex';
             div.style.alignItems = 'center';
             div.style.justifyContent = 'center';
             div.style.backgroundColor = this.getGenerationColor(person.generation);
             div.style.border = `3px solid ${this.getGenerationColor(person.generation)}`;
            
            const img = document.createElement('img');
            img.src = person.photo;
            img.alt = person.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            
            // Handle image load/error
            img.onload = () => {
                // Photo loaded successfully
                div.style.backgroundColor = 'transparent';
            };
            
            img.onerror = () => {
                // Photo failed to load, show initials
                div.innerHTML = `<div style="color: white; font-weight: bold; font-size: 18px;">${this.getInitials(person.name)}</div>`;
            };
            
            div.appendChild(img);
            foreignObject.appendChild(div);
            group.appendChild(foreignObject);
        } else {
            // Add initials if no photo
        const initials = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        initials.setAttribute('x', position.x);
        initials.setAttribute('y', position.y);
        initials.classList.add('tree-node-text');
            initials.setAttribute('text-anchor', 'middle');
            initials.setAttribute('dominant-baseline', 'middle');
            initials.setAttribute('font-size', '18px');
            initials.setAttribute('font-weight', 'bold');
            initials.setAttribute('fill', 'white');
        initials.textContent = this.getInitials(person.name);
        group.appendChild(initials);
        }

        // Name text with better positioning
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', position.x);
        text.setAttribute('y', position.y + 70);
        text.classList.add('tree-node-text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '14px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#333');
        text.textContent = person.name;

        group.appendChild(text);

        // Click handler
        group.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showPersonProfile(person);
        });

        // Touch handler for mobile devices
        group.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Store the touch start time to detect taps vs drags
            group.touchStartTime = Date.now();
        }, { passive: false });

        group.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Check if this was a tap (not a drag)
            const touchDuration = Date.now() - group.touchStartTime;
            if (touchDuration < 300) { // Less than 300ms = tap
                this.showPersonProfile(person);
            }
        }, { passive: false });

        group.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.showPersonProfile(person);
            }
        });

        svg.appendChild(group);
    }

    getGenerationColor(generation) {
        const colors = {
            0: '#4a90e2', // Blue for root
            1: '#7cb342', // Green for children
            2: '#ff9800'  // Orange for grandchildren
        };
        return colors[generation] || '#9e9e9e';
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Zoom control functions
    zoomIn() {
        const svg = document.getElementById('familyTreeSvg');
        if (!svg) return;
        
        const currentViewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const zoom = 0.8;
        
        const newWidth = currentViewBox[2] * zoom;
        const newHeight = currentViewBox[3] * zoom;
        const newX = currentViewBox[0] + (currentViewBox[2] - newWidth) / 2;
        const newY = currentViewBox[1] + (currentViewBox[3] - newHeight) / 2;
        
        svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
    }

    zoomOut() {
        const svg = document.getElementById('familyTreeSvg');
        if (!svg) return;
        
        const currentViewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const zoom = 1.2;
        
        const newWidth = currentViewBox[2] * zoom;
        const newHeight = currentViewBox[3] * zoom;
        const newX = currentViewBox[0] + (currentViewBox[2] - newWidth) / 2;
        const newY = currentViewBox[1] + (currentViewBox[3] - newHeight) / 2;
        
        svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
    }

    resetView() {
        const svg = document.getElementById('familyTreeSvg');
        if (!svg) return;
        
        svg.setAttribute('viewBox', '0 0 1800 1600');
    }

    // Profile modal
    showPersonProfile(person) {
        const modal = document.getElementById('profileModal');
        const photo = document.getElementById('profileModalPhoto');
        const name = document.getElementById('profileModalName');
        const details = document.getElementById('profileModalDetails');

        if (!modal || !photo || !name || !details) return;

        // Set photo or initials
        photo.innerHTML = '';
        if (person.photo) {
            const img = document.createElement('img');
            img.src = person.photo;
            img.alt = person.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            photo.appendChild(img);
        } else {
            photo.textContent = this.getInitials(person.name);
        }

        name.textContent = person.name;

        // Build details
        const detailsHTML = [];
        if (person.spouse) {
            const spouse = this.familyData.find(p => p.id === person.spouse);
            if (spouse) {
                detailsHTML.push(`<strong>Spouse:</strong> ${spouse.name}`);
            }
        }
        if (person.children && person.children.length > 0) {
            const childrenNames = person.children.map(childId => {
                const child = this.familyData.find(p => p.id === childId);
                return child ? child.name : '';
            }).filter(name => name);
            if (childrenNames.length > 0) {
                detailsHTML.push(`<strong>Children:</strong> ${childrenNames.join(', ')}`);
            }
        }
        if (person.parents && person.parents.length > 0) {
            const parentsNames = person.parents.map(parentId => {
                const parent = this.familyData.find(p => p.id === parentId);
                return parent ? parent.name : '';
            }).filter(name => name);
            if (parentsNames.length > 0) {
                detailsHTML.push(`<strong>Parents:</strong> ${parentsNames.join(', ')}`);
            }
        }

        details.innerHTML = detailsHTML.join('<br>');

        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    }

    hideProfileModal() {
        const modal = document.getElementById('profileModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.classList.add('hidden'), 250);
        }
    }

    hideAllModals() {
        this.hideProfileModal();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    familyTreeApp = new FamilyTreeApp();
});

// Global functions for zoom controls
function zoomIn() {
    if (familyTreeApp) {
        familyTreeApp.zoomIn();
    }
}

function zoomOut() {
    if (familyTreeApp) {
        familyTreeApp.zoomOut();
    }
}

function resetTreeView() {
    if (familyTreeApp) {
        familyTreeApp.resetView();
    }
}