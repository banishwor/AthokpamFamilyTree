// Family Tree Web Application - Static Viewer
class FamilyTreeApp {
    constructor() {
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
                "children": ["sanahal-athokpam", "inao-athokpam", "indu-athokpam", "sarat-athokpam", "basanta-athokpam", "tamphasana-athokpam"],
                "relationship": "Father"
            },
            {
                "id": "mangolnganbi-athokpam",
                "name": "Mangolnganbi Athokpam",
                "photo": "photos/mangolnganbi.jpg", 
                "generation": 0,
                "parents": [],
                "spouse": "shamu-athokpam",
                "children": ["sanahal-athokpam", "inao-athokpam", "indu-athokpam", "sarat-athokpam", "basanta-athokpam", "tamphasana-athokpam"],
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
                "id": "inao-athokpam",
                "name": "Inao Athokpam", 
                "photo": "photos/inao.jpg",
                "generation": 1,
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"],
                "spouse": "bino-athokpam", 
                "children": ["chaoba-athokpam", "omita-athokpam", "itombi-athokpam", "naobi-athokpam", "gojendro-athokpam"],
                "relationship": "Son (2nd)"
            },
            {
                "id": "indu-athokpam", 
                "name": "Indu Athokpam",
                "photo": "photos/indu.jpg",
                "generation": 1,
                "parents": ["shamu-athokpam", "mangolnganbi-athokpam"], 
                "spouse": "ngambi-athokpam",
                "children": ["jobistra-athokpam", "bandana-athokpam", "bandeshowri-athokpam", "reteshwori-athokpam"],
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
                "spouse": null,
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

            // Second Generation (Generation 2) - Indu's Family
            {
                "id": "ngambi-athokpam",
                "name": "Ngambi Athokpam",
                "photo": "photos/ngambi.jpg",
                "generation": 1,
                "parents": [],
                "spouse": "indu-athokpam",
                "children": ["jobistra-athokpam", "bandana-athokpam", "bandeshowri-athokpam", "reteshwori-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "jobistra-athokpam",
                "name": "Jobistra Athokpam",
                "photo": "photos/jobistra.jpg",
                "generation": 2,
                "parents": ["indu-athokpam", "ngambi-athokpam"],
                "spouse": null,
                "children": [],
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
                "id": "bandeshowri-athokpam",
                "name": "Bandeshowri Athokpam",
                "photo": "photos/bandeshowri.jpg",
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

            // Second Generation (Generation 2) - Inao's Family
            {
                "id": "bino-athokpam",
                "name": "Bino Athokpam",
                "photo": "photos/bino.jpg",
                "generation": 1,
                "parents": [],
                "spouse": "inao-athokpam",
                "children": ["chaoba-athokpam", "omita-athokpam", "itombi-athokpam", "naobi-athokpam", "gojendro-athokpam"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "chaoba-athokpam",
                "name": "Chaoba Athokpam",
                "photo": "photos/chaoba.jpg",
                "generation": 2,
                "parents": ["inao-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "omita-athokpam",
                "name": "Omita Athokpam",
                "photo": "photos/omita.jpg",
                "generation": 2,
                "parents": ["inao-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "itombi-athokpam",
                "name": "Itombi Athokpam",
                "photo": "photos/itombi.jpg",
                "generation": 2,
                "parents": ["inao-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "naobi-athokpam",
                "name": "Naobi Athokpam",
                "photo": "photos/naobi.jpg",
                "generation": 2,
                "parents": ["inao-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "gojendro-athokpam",
                "name": "Gojendro Athokpam",
                "photo": "photos/gojendro.jpg",
                "generation": 2,
                "parents": ["inao-athokpam", "bino-athokpam"],
                "spouse": null,
                "children": [],
                "relationship": "Grandson"
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

    // Family tree rendering
    renderFamilyTree() {
        const svg = document.getElementById('familyTreeSvg');
        if (!svg) return;
        
        svg.innerHTML = '';

        const width = 1200;
        const height = 600;
        const generationHeight = 150;
        const nodeWidth = 120;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Group by generation
        const generations = {};
        this.familyData.forEach(person => {
            if (!generations[person.generation]) {
                generations[person.generation] = [];
            }
            generations[person.generation].push(person);
        });

        // Calculate positions
        const positions = {};
        Object.keys(generations).forEach(gen => {
            const genNum = parseInt(gen);
            const members = generations[gen];
            const y = 80 + genNum * generationHeight;
            const totalWidth = members.length * nodeWidth;
            const startX = (width - totalWidth) / 2 + nodeWidth / 2;

            members.forEach((member, index) => {
                positions[member.id] = {
                    x: startX + index * nodeWidth,
                    y: y
                };
            });
        });

        // Draw connections
        this.drawConnections(svg, positions);

        // Draw nodes
        this.familyData.forEach(person => {
            this.drawFamilyNode(svg, person, positions[person.id]);
        });
    }

    drawConnections(svg, positions) {
        this.familyData.forEach(person => {
            if (person.children && person.children.length > 0) {
                const parentPos = positions[person.id];
                person.children.forEach(childId => {
                    const child = this.familyData.find(p => p.id === childId);
                    if (child) {
                        const childPos = positions[childId];
                        
                        // Create connection line
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        const path = `M ${parentPos.x} ${parentPos.y + 35} 
                                     Q ${parentPos.x} ${parentPos.y + 75} 
                                       ${(parentPos.x + childPos.x) / 2} ${(parentPos.y + childPos.y) / 2}
                                     Q ${childPos.x} ${childPos.y - 75}
                                       ${childPos.x} ${childPos.y - 35}`;
                        
                        line.setAttribute('d', path);
                        line.classList.add('tree-connection');
                        svg.appendChild(line);
                    }
                });
            }
        });
    }

    drawFamilyNode(svg, person, position) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('tree-node');
        group.setAttribute('tabindex', '0');
        group.setAttribute('role', 'button');
        group.setAttribute('aria-label', `View ${person.name}'s profile`);

        // Node circle/photo
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', position.x);
        circle.setAttribute('cy', position.y);
        circle.setAttribute('r', 30);
        circle.classList.add('tree-node-circle');
        circle.classList.add(`generation-${person.generation}`);

        // Name text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', position.x);
        text.setAttribute('y', position.y + 50);
        text.classList.add('tree-node-text');
        text.textContent = person.name;

        // Initials inside circle
        const initials = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        initials.setAttribute('x', position.x);
        initials.setAttribute('y', position.y);
        initials.classList.add('tree-node-text');
        initials.style.fill = 'white';
        initials.style.fontSize = '16px';
        initials.style.fontWeight = 'bold';
        initials.textContent = this.getInitials(person.name);

        group.appendChild(circle);
        group.appendChild(initials);
        group.appendChild(text);

        // Click handler
        group.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showPersonProfile(person);
        });

        group.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.showPersonProfile(person);
            }
        });

        svg.appendChild(group);
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Profile modal
    showPersonProfile(person) {
        const modal = document.getElementById('profileModal');
        const photo = document.getElementById('profileModalPhoto');
        const name = document.getElementById('profileModalName');
        const relationship = document.getElementById('profileModalRelationship');
        const details = document.getElementById('profileModalDetails');

        if (!modal || !photo || !name || !relationship || !details) return;

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
        relationship.textContent = person.relationship;

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
    new FamilyTreeApp();
});