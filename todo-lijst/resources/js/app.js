import Task from "./task.ts";
customElements.define("custom-task", Task);

document.addEventListener("task-moved", (e) => {
  const { id, from, to, _ } = e.detail;
  const fromCol = from.closest(".task-type").id;
  const toCol = to.closest(".task-type").id;
  fetch("/api/tasks/updateState", { 
    method: "POST", 
    headers: {"Content-Type": "application/json"}, 
    body: JSON.stringify({ id: id, fromCol, toCol }) 
  });
});

document.addEventListener("task-renamed", (e) => {
  fetch("/api/tasks/updateDescription", { 
    method: "POST", 
    headers: {"Content-Type": "application/json"}, 
    body: JSON.stringify({ id: e.detail.id, description: e.detail.description }) 
  });
});