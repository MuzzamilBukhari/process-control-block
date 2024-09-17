class PCB {
  constructor(arrTime, exeTime, processId, processState) {
    this.arrTime = arrTime;
    this.exeTime = exeTime;
    this.startTime = -1;
    this.finishTime = "calculating...";
    this.TAtime = "calculating...";
    this.waitTime = 0;
    this.utilization = "calculating...";
    this.processId = processId;
    this.PC = 1;
    this.IR = 1;
    this.processState = processState;
  }
}

let totalExeTime = 0;
let PCBs = [];
let processes = [];

// Capture the number of processes and generate input fields for execution times
document.getElementById("numProcesses").addEventListener("change", function () {
  const numProcesses = Number(this.value);
  const processInputContainer = document.getElementById(
    "processInputContainer"
  );
  processInputContainer.innerHTML = ""; // Clear any previous input fields

  for (let i = 0; i < numProcesses; i++) {
    const processGroup = document.createElement("div");
    processGroup.classList.add("form-group");

    const label = document.createElement("label");
    label.textContent = `Execution time for Process ${i + 1}:`;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.id = `executionTime${i}`;
    input.classList.add("input-field");

    processGroup.appendChild(label);
    processGroup.appendChild(input);
    processInputContainer.appendChild(processGroup);
  }
});

document.getElementById("startSimulation").addEventListener("click", () => {
  totalExeTime = 0;
  PCBs = [];
  processes = [];

  const n = Number(document.getElementById("numProcesses").value);
  const quantum = Number(document.getElementById("quantum").value);

  for (let i = 0; i < n; i++) {
    const et = Number(document.getElementById(`executionTime${i}`).value);
    totalExeTime += et;
    processes[i] = new Array(et);
    for (let j = 0; j < et; j++) {
      processes[i][j] = `Instruction ${j + 1}`;
    }
    const pcb = new PCB(i, processes[i].length, `p${i + 1}`, "readyQueue");
    PCBs.push(pcb);
  }

  simulateProcesses(n, quantum);
});

function simulateProcesses(n, quantum) {
  let counter = 1;
  let p = 0;
  let count = 0;

  let outputDiv = document.getElementById("output");
  outputDiv.innerHTML = ""; // Clear previous output

  while (counter <= totalExeTime) {
    if (PCBs[p].IR <= processes[p].length) {
      // set start time if process run first time
      if (PCBs[p].startTime === -1) {
        PCBs[p].startTime = counter - 1;
      }

      // set pc (program counter) to next uncomleted process
      let nextProcess = (p + 1) % n;
      while (
        PCBs[nextProcess].finishTime !== "calculating..." &&
        nextProcess !== p
      ) {
        nextProcess = (nextProcess + 1) % n; // Move to the next uncompleted process
      }
      // Set PC to the next uncompleted process
      if (counter === totalExeTime) {
        PCBs[p].PC = `All processes completely executed!!`;
      } else {
        PCBs[p].PC = `starting address of  Process p${nextProcess + 1}`;
      }

      // calculate finish time, turn around time and utilization
      if (PCBs[p].IR === processes[p].length) {
        PCBs[p].finishTime = counter;
        PCBs[p].TAtime = PCBs[p].finishTime - PCBs[p].arrTime;
        PCBs[p].utilization = parseFloat(
          (PCBs[p].exeTime / PCBs[p].TAtime).toFixed(2)
        );
      }

      // increment to run next quantum
      count++;

      // set the value of IR (Information register)
      if (PCBs[p].IR === processes[p].length) {
        PCBs[p].IR = "Process completely executed";
      } else {
        PCBs[p].IR += 1;
      }

      PCBs[p].waitTime = `${PCBs[p].startTime - PCBs[p].arrTime} quantum`;
      displayPCBInfo(PCBs[p], counter);

      if (count === quantum) {
        count = 0; // Reset count
        p = (p + 1) % n; // Move to the next process
      }
      counter++;
    } else {
      p = (p + 1) % n;
    }
  }
}

function displayPCBInfo(pcb, counter) {
  let outputDiv = document.getElementById("output");

  let pcbBlock = document.createElement("div");
  pcbBlock.classList.add("process-block");

  pcbBlock.innerHTML = `
      <p>After running quantum ${counter} :</p>
      <h3>Process Control Block of Process: ${pcb.processId}</h3>
      <p>Arrival Time: ${pcb.arrTime} quantum</p>
      <p>Execution Time: ${pcb.exeTime} quantums</p>
      <p>Start Time: ${pcb.startTime} quantum</p>
      <p>Finish Time: ${pcb.finishTime} quantums</p>
      <p>Turnaround Time: ${pcb.TAtime} quantums</p>
      <p>Wait Time: ${pcb.waitTime}</p>
      <p>Utilization: ${pcb.utilization}</p>
      <p>Program Counter (PC): ${pcb.PC}</p>
      <p>Information Register (IR): ${pcb.IR}</p>
      <p>Process State: ${pcb.processState}</p>
  `;
  outputDiv.appendChild(pcbBlock);
}
