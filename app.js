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

    // Load sample family data
    loadSampleData() {
        this.familyData = [
            {
                "id": "john-doe",
                "name": "John Doe", 
                "photo": null,
                "generation": 0,
                "parents": [],
                "spouse": "jane-doe",
                "children": ["mike-doe", "sarah-johnson"],
                "relationship": "Father"
            },
            {
                "id": "jane-doe",
                "name": "Jane Doe",
                "photo": null, 
                "generation": 0,
                "parents": [],
                "spouse": "john-doe",
                "children": ["mike-doe", "sarah-johnson"],
                "relationship": "Mother"
            },
            {
                "id": "mike-doe",
                "name": "Mike Doe",
                "photo": null,
                "generation": 1, 
                "parents": ["john-doe", "jane-doe"],
                "spouse": "lisa-doe",
                "children": ["emma-doe", "jack-doe"],
                "relationship": "Son"
            },
            {
                "id": "sarah-johnson", 
                "name": "Sarah Johnson",
                "photo": null,
                "generation": 1,
                "parents": ["john-doe", "jane-doe"], 
                "spouse": "david-johnson",
                "children": ["alex-johnson"],
                "relationship": "Daughter"
            },
            {
                "id": "lisa-doe",
                "name": "Lisa Doe", 
                "photo": null,
                "generation": 1,
                "parents": [],
                "spouse": "mike-doe", 
                "children": ["emma-doe", "jack-doe"],
                "relationship": "Daughter-in-law"
            },
            {
                "id": "david-johnson",
                "name": "David Johnson",
                "photo": null,
                "generation": 1, 
                "parents": [],
                "spouse": "sarah-johnson",
                "children": ["alex-johnson"], 
                "relationship": "Son-in-law"
            },
            {
                "id": "emma-doe",
                "name": "Emma Doe", 
                "photo": null,
                "generation": 2,
                "parents": ["mike-doe", "lisa-doe"],
                "spouse": null,
                "children": [],
                "relationship": "Granddaughter"
            },
            {
                "id": "jack-doe", 
                "name": "Jack Doe",
                "photo": null,
                "generation": 2,
                "parents": ["mike-doe", "lisa-doe"],
                "spouse": null,
                "children": [],
                "relationship": "Grandson"
            },
            {
                "id": "alex-johnson",
                "name": "Alex Johnson",
                "photo": null,
                "generation": 2,
                "parents": ["sarah-johnson", "david-johnson"],
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