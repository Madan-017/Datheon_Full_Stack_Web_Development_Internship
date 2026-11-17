# 🛍️ ShopSphere – Modern E-Commerce Storefront

ShopSphere is a modern, colorful, and responsive e-commerce storefront built using HTML, CSS, and JavaScript. It fetches product information from FakeStoreAPI and provides an interactive shopping experience with product filtering, search, sorting, and a persistent shopping cart.

## ✨ Features

- 🛒 **Product Catalog** – Fetch products dynamically from FakeStoreAPI.
- 🖼️ **Product Cards** – Display product images, names, prices, ratings, and badges.
- 🔍 **Product Search** – Search for products by name.
- 🏷️ **Category Filtering** – Filter products by:
  - Electronics
  - Jewelry
  - Men's Clothing
  - Women's Clothing
- ↕️ **Product Sorting** – Sort products using available sorting options.
- ❤️ **Favorite Button** – Interact with favorite product controls.
- 🛍️ **Shopping Cart** – Add and remove products from the cart.
- ➕➖ **Quantity Controls** – Increase or decrease product quantities.
- 💾 **Persistent Cart** – Save cart information using browser localStorage.
- 🧮 **Price Calculation** – Automatically calculate:
  - Subtotal
  - Tax (8%)
  - Shipping charges
  - Final total
- 🚚 **Free Shipping** – Free shipping on orders of $100 or more.
- 💳 **Checkout Modal** – Enter customer information and simulate checkout.
- 🎉 **Order Confirmation** – Display a confirmation after simulated checkout.
- 🌙 **Dark/Light Theme** – Switch between visual themes.
- 🎨 **Modern UI** – Colorful gradients, animations, hover effects, and smooth transitions.
- 📱 **Responsive Design** – Optimized for desktop, tablet, and mobile devices.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- FakeStoreAPI
- Fetch API
- Async/Await
- DOM Manipulation
- Browser localStorage

## 📂 Project Structure

```text
Ecommerce-Store/
│
├── index.html
├── style.css
├── script.js
├── README.md
└── favicon.svg
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Madan-017/Datheon_Full_Stack_Web_Development_Internship.git
```

### 2. Open the Project Folder

Navigate to the `Ecommerce-Store` folder.

### 3. Run the Application

Open the project in Visual Studio Code.

Start a local server using Live Server or run:

```bash
npx http-server . -p 8081
```

Open the local URL displayed in your terminal.

## 🌐 API Used

**FakeStoreAPI**

[https://fakestoreapi.com/products](https://fakestoreapi.com/products)

The API provides sample product information, including:

- Product title
- Product image
- Product price
- Product category
- Product description
- Product rating

## 💰 Shopping Calculations

| Calculation | Rule |
|---|---|
| Subtotal | Sum of product prices × quantities |
| Tax | 8% of subtotal |
| Shipping | $5 for orders below $100 |
| Free Shipping | Orders of $100 or more |
| Total | Subtotal + Tax + Shipping |

## 💡 Important Note

This project is a frontend demonstration. Checkout is simulated, and it does not process real payments or create actual orders with a backend server.

## 🎯 Project Objective

The objective of this project is to build a modern e-commerce storefront while practicing API integration, JavaScript DOM manipulation, event handling, localStorage, dynamic product rendering, shopping cart functionality, and responsive web design.

## 👨‍💻 Author

**Madan B K**

- GitHub: [Madan-017](https://github.com/Madan-017)
- LinkedIn: [Madan B K](https://www.linkedin.com/in/madan-b-k-12a658393/)

---

⭐ If you like this project, consider giving the repository a star!