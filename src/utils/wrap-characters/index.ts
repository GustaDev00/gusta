export const WrapCharacters = (element: Element) => {
  const text = element.textContent || "";
  element.innerHTML = "";
  for (const char of text) {
    const charSpan = document.createElement("span");
    charSpan.textContent = char;
    element.appendChild(charSpan);
  }
};
