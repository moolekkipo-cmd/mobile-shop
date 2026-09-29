const productCards = Array.from(document.querySelectorAll(".product-card"));
const cartButton = document.querySelector(".navbar .btn-primary");
const promotionButton = document.querySelector("#promotion .btn-dark");
const cart = new Map();

const products = productCards.map((card) => {
    const priceText = card.querySelector(".text-danger")?.textContent ?? "0";

    return {
        name: card.querySelector(".card-title")?.textContent.trim() ?? "สินค้า",
        brand: card.querySelector("small")?.textContent.trim() ?? "",
        storage: card.querySelector(".card-body p")?.textContent.trim() ?? "",
        price: Number(priceText.replace(/[^\d]/g, "")),
        image: card.querySelector("img")?.src ?? "",
        imageAlt: card.querySelector("img")?.alt ?? "รูปสินค้า"
    };
});

const modalElement = document.createElement("div");
modalElement.className = "modal fade";
modalElement.tabIndex = -1;
modalElement.setAttribute("aria-hidden", "true");
modalElement.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title fs-5"></h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
        </div>
    </div>
`;
document.body.append(modalElement);

const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
const modalTitle = modalElement.querySelector(".modal-title");
const modalBody = modalElement.querySelector(".modal-body");
const modalFooter = modalElement.querySelector(".modal-footer");

function setModal(title, body, buttons = []) {
    modalTitle.textContent = title;
    modalBody.replaceChildren(body);
    modalFooter.replaceChildren(...buttons);
    modal.show();
}

function makeCloseButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-secondary";
    button.textContent = "ปิด";
    button.setAttribute("data-bs-dismiss", "modal");
    return button;
}

function updateCartBadge() {
    if (!cartButton) return;

    let badge = cartButton.querySelector(".cart-count");
    if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge bg-light text-primary ms-2 cart-count";
        cartButton.append(badge);
    }

    const itemCount = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = itemCount;
    badge.classList.toggle("d-none", itemCount === 0);
}

function openProductDetails(product) {
    const content = document.createElement("div");
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.imageAlt;
    image.className = "img-fluid rounded mb-3 w-100";
    image.style.maxHeight = "260px";
    image.style.objectFit = "contain";

    const brand = document.createElement("p");
    brand.className = "text-secondary mb-1";
    brand.textContent = product.brand;

    const storage = document.createElement("p");
    storage.className = "mb-2";
    storage.textContent = product.storage;

    const price = document.createElement("h3");
    price.className = "text-danger fw-bold fs-4 mb-0";
    price.textContent = `฿${product.price.toLocaleString("th-TH")}`;

    content.append(image, brand, storage, price);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "btn btn-primary";
    addButton.textContent = "เพิ่มลงตะกร้า";
    addButton.addEventListener("click", () => {
        const current = cart.get(product.name);
        cart.set(product.name, {
            product,
            quantity: (current?.quantity ?? 0) + 1
        });
        updateCartBadge();

        const confirmation = document.createElement("p");
        confirmation.className = "mb-0";
        confirmation.textContent = `เพิ่ม ${product.name} ลงตะกร้าแล้ว`;
        setModal("เพิ่มสินค้าสำเร็จ", confirmation, [makeCloseButton()]);
    });

    setModal(product.name, content, [makeCloseButton(), addButton]);
}

function openCart() {
    const content = document.createElement("div");
    const entries = Array.from(cart.values());

    if (entries.length === 0) {
        content.textContent = "ยังไม่มีสินค้าในตะกร้า";
        setModal("ตะกร้าสินค้า", content, [makeCloseButton()]);
        return;
    }

    const list = document.createElement("div");
    list.className = "list-group mb-3";
    let total = 0;

    entries.forEach(({ product, quantity }) => {
        const row = document.createElement("div");
        row.className = "list-group-item d-flex justify-content-between align-items-center gap-3";

        const description = document.createElement("div");
        const name = document.createElement("div");
        name.className = "fw-semibold";
        name.textContent = product.name;
        const count = document.createElement("small");
        count.className = "text-secondary";
        count.textContent = `จำนวน ${quantity} เครื่อง`;
        description.append(name, count);

        const subtotal = product.price * quantity;
        total += subtotal;
        const amount = document.createElement("span");
        amount.className = "text-nowrap";
        amount.textContent = `฿${subtotal.toLocaleString("th-TH")}`;

        row.append(description, amount);
        list.append(row);
    });

    const totalLine = document.createElement("p");
    totalLine.className = "text-end fw-bold mb-0";
    totalLine.textContent = `รวม ฿${total.toLocaleString("th-TH")}`;
    content.append(list, totalLine);
    setModal("ตะกร้าสินค้า", content, [makeCloseButton()]);
}

productCards.forEach((card, index) => {
    const button = card.querySelector(".btn");
    const product = products[index];
    button?.addEventListener("click", () => openProductDetails(product));
});

cartButton?.addEventListener("click", openCart);

promotionButton?.addEventListener("click", () => {
    const content = document.createElement("p");
    content.className = "mb-0";
    content.textContent = "ลดสูงสุด 3,000 บาท สำหรับสินค้าที่ร่วมรายการ";
    setModal("โปรโมชั่นพิเศษ", content, [makeCloseButton()]);
});

updateCartBadge();
