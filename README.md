# 🌳 Family Tree Viewer

A beautiful, interactive family tree visualization built with HTML, CSS, and JavaScript.

## ✨ Features

- **Interactive Family Tree**: Click on any family member to view their profile
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern design with smooth animations
- **Profile Details**: View relationships, spouses, children, and parents
- **Static Site**: No server required - perfect for free hosting

## 🚀 Live Demo

Visit the live site: [Your GitHub Pages URL will be here]

## 📁 Project Structure

```
FamilyTree/
├── index.html      # Main HTML file
├── style.css       # Styling and animations
├── app.js          # JavaScript functionality
└── README.md       # This file
```

## 🛠️ How to Use

1. **View the Tree**: The family tree is displayed automatically when you load the page
2. **Click on Members**: Click any family member's circle to view their profile
3. **View Details**: See relationships, spouses, children, and parents in the profile modal
4. **Close Modal**: Click the X button or press Escape to close the profile

## 🎨 Customization

To add your own family members, edit the `familyData` array in `app.js`:

```javascript
{
    "id": "unique-id",
    "name": "Full Name",
    "photo": null, // Add photo URL here
    "generation": 0, // 0 = oldest generation
    "parents": [], // Array of parent IDs
    "spouse": "spouse-id", // Spouse's ID
    "children": [], // Array of children IDs
    "relationship": "Father/Mother/Son/Daughter/etc"
}
```

## 🌐 Hosting

This project is designed to work with static hosting services like:
- GitHub Pages
- Netlify
- Vercel
- Any web server

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

Feel free to fork this project and customize it for your own family!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ for families everywhere
