// task.ts
const DRAG_THRESHOLD = 4;

export interface TaskMovedDetail {
  id: string;
  from: HTMLElement;
  to: HTMLElement;
  index: number;
}

export interface TaskRenamedDetail {
  id: string;
  description: string;
}

export default class Task extends HTMLElement {
  #uuid: string | null = null;
  #state: string | null = null;
  #pointerId: number | null = null;
  #dragging = false;
  #startX = 0;
  #startY = 0;
  #savedStyle = "";
  #editing = false;
  #originalText = "";
  #from: HTMLElement | null = null;
  #placeholder: HTMLElement | null = null;

  constructor() {
    super();
    this.#uuid = this.getAttribute("wire:key")
    this.addEventListener("pointerdown", this.#onPointerDown);
    this.addEventListener("dblclick", this.#onDblClick);
    this.addEventListener("keydown", this.#onSelfKeyDown);
  }

  connectedCallback() {
    if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
  }

  disconnectedCallback() {
    if (this.#dragging && !this.isConnected) this.#finishDragging(false);
    if (this.#editing && !this.isConnected) this.#endEdit(false);
  }

  #onDblClick = (e: MouseEvent) => {
    if (this.#dragging || this.#editing) return;
    e.preventDefault();
    this.#startEdit();
  };

  #onSelfKeyDown = (e: KeyboardEvent) => {
    if (!this.#editing) {
      if ((e.key === "Enter" || e.key === "F2") && e.target === this) {
        e.preventDefault();
        this.#startEdit();
      }
      return;
    }
    if (e.key === "Enter") { e.preventDefault(); this.#endEdit(true); }
    else if (e.key === "Escape") { e.preventDefault(); this.#endEdit(false); }
  };

  #onBlur = () => this.#endEdit(true);

  #startEdit() {
    this.#editing = true;
    this.#originalText = (this.textContent ?? "").trim();
    this.textContent = this.#originalText;
    try { this.contentEditable = "plaintext-only"; }
    catch { this.contentEditable = "true"; } // older browsers throw on plaintext-only
    this.classList.add("editing");
    this.addEventListener("blur", this.#onBlur);
    this.focus();

    const range = document.createRange();
    range.selectNodeContents(this);
    const sel = getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  #endEdit(commit: boolean) {
    if (!this.#editing) return;
    this.#editing = false;
    this.removeEventListener("blur", this.#onBlur);
    this.removeAttribute("contenteditable");
    this.classList.remove("editing");

    const oldText = this.#originalText;
    const newText = (this.textContent ?? "").trim();
    if (!commit || newText === "" || newText === oldText || this.#uuid === null) {
      this.textContent = oldText;
      return;
    }
    this.textContent = newText; // normalises anything the "true" fallback let through
    this.dispatchEvent(new CustomEvent<TaskRenamedDetail>("task-renamed", {
      bubbles: true,
      detail: { id: this.#uuid, description: newText },
    }));


  }

  #onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || this.#pointerId !== null) return;
    this.#pointerId = e.pointerId;
    this.#startX = e.clientX;
    this.#startY = e.clientY;
    document.addEventListener("pointermove", this.#onPointerMove);
    document.addEventListener("pointerup", this.#onPointerUp);
    document.addEventListener("pointercancel", this.#onPointerCancel);
  };

  #onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== this.#pointerId) return;
    if (!this.#dragging) {
      if (Math.hypot(e.clientX - this.#startX, e.clientY - this.#startY) < DRAG_THRESHOLD) return;
      this.#beginDrag();
    }
    e.preventDefault();
    this.style.transform = `translate(${e.clientX - this.#startX}px, ${e.clientY - this.#startY}px)`;
    this.#updatePlaceholder(e.clientX, e.clientY);
  };

  #onPointerUp = (e: PointerEvent) => {
    if (e.pointerId === this.#pointerId) this.#finishDragging(true);
  };

  #onPointerCancel = (e: PointerEvent) => {
    if (e.pointerId === this.#pointerId) this.#finishDragging(false);
  };

  #onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.#finishDragging(false);
  };

  #beginDrag() {
    this.#dragging = true;
    const rect = this.getBoundingClientRect();
    this.#from = this.parentElement!;

    this.#placeholder = document.createElement("div");
    this.#placeholder.className = "drop-indicator";
    this.#from.insertBefore(this.#placeholder, this);

    this.#savedStyle = this.style.cssText;
    Object.assign(this.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      zIndex: "1000",
      pointerEvents: "none",
    });
    this.classList.add("dragging");
    document.body.classList.add("is-dragging");
    document.addEventListener("keydown", this.#onKeyDown);
  }

  #updatePlaceholder(x: number, y: number) {
    const container = document
      .elementFromPoint(x, y)
      ?.closest(".task-type")
      ?.querySelector<HTMLElement>(":scope > .task-container");
    const ph = this.#placeholder;
    if (!container || !ph) return;

    const tasks = [...container.querySelectorAll<HTMLElement>(":scope > custom-task")]
      .filter((t) => t !== this);
    const before =
      tasks.find((t) => {
        const r = t.getBoundingClientRect();
        return y < r.top + r.height / 2;
      }) ?? container.querySelector<HTMLElement>(":scope > .task-add");

    if (before) {
      if (ph.nextElementSibling !== before) container.insertBefore(ph, before);
    } else if (container.lastElementChild !== ph) {
      container.append(ph);
    }
  }

  #finishDragging(commit: boolean) {
    document.removeEventListener("pointermove", this.#onPointerMove);
    document.removeEventListener("pointerup", this.#onPointerUp);
    document.removeEventListener("pointercancel", this.#onPointerCancel);
    document.removeEventListener("keydown", this.#onKeyDown);
    this.#pointerId = null;
    if (!this.#dragging) return;
    this.#dragging = false;

    const ph = this.#placeholder!;
    const from = this.#from!;
    const unchanged = ph.nextElementSibling === this || ph.previousElementSibling === this;

    this.style.cssText = this.#savedStyle;
    this.classList.remove("dragging");
    document.body.classList.remove("is-dragging");

    if (commit && !unchanged && ph.parentElement && this.#uuid !== null) {
      const to = ph.parentElement;
      const moveBefore = (to as any).moveBefore as ((n: Node, c: Node) => void) | undefined;
      if (moveBefore) moveBefore.call(to, this, ph); // preserves state, fires connectedMoveCallback
      else to.insertBefore(this, ph);                // fires disconnected + connected
      ph.remove();

      const index = [...to.querySelectorAll(":scope > custom-task")].indexOf(this);
      this.dispatchEvent(
        new CustomEvent<TaskMovedDetail>("task-moved", {
          bubbles: true,
          detail: { id: this.#uuid, from, to, index },
        }),
      );
    } else {
      ph.remove();
    }

    window.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
    this.#placeholder = null;
    this.#from = null;
  }
}