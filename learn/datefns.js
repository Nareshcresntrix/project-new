const { parse, isBefore, isEqual, isAfter, isValid, parseISO } = dateFns;
const startdataEl = document.getElementById("startDate");
const enddataEl = document.getElementById("endDate");
const starttimeEl = document.getElementById("startTime");
const endtimeEl = document.getElementById("endTime");
const addprice = document.getElementById("Addprice");
const Addcategory = document.getElementById("Addcategory");
const addpriceplan = document.getElementById("addpriceplan");
const tdata = document.getElementById("tdata");
const tdata2 = document.getElementById("tdata2");
const tdata3 = document.getElementById("tdata3");
const updatebtn = document.getElementById("update");
const thearterinput = document.querySelector("#thearter input[type='text']");
const selects = document.getElementById("theaterSelect");
const h1 = document.getElementById("element");
const alldatetime = [];
const theaternamearrEll = [];

let previousStart = starttimeEl.value;
let previousEnd = endtimeEl.value;
let perviousstartdate = startdataEl.value;
let perviousenddate = enddataEl.value;
//  Check if any row exists
function hasAnyShowtimeRow() {
  return tdata.querySelectorAll("tr").length > 0;
}
function hasAnyPricePlan() {
  return tdata3.querySelectorAll("tr").length > 0;
}
//  Clear all time inputs in the daily showtimes table
function clearAllDailyTimeInputs() {
  if (alldatetime.length === 0) return;

  const basedate = new Date(); // Used for parsing

  const defaultStart = parse(alldatetime[0].starttime, "HH:mm", basedate);
  const defaultEnd = parse(alldatetime[0].endtime, "HH:mm", basedate);

  const rows = tdata.querySelectorAll("tr");

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input[type='time']");
    const startInput = inputs[0];
    const endInput = inputs[1];

    if (!startInput || !endInput || !startInput.value || !endInput.value)
      return;

    const rowStart = parse(startInput.value, "HH:mm", basedate);
    const rowEnd = parse(endInput.value, "HH:mm", basedate);

    const isOutOfRange =
      isBefore(rowStart, defaultStart) || isAfter(rowEnd, defaultEnd);

    if (isOutOfRange) {
      startInput.value = "";
      endInput.value = "";
    }
  });
  validate(row);
}
function clearalldate() {
  if (alldatetime.length === 0) return;

  const defaultstartdate = parseISO(alldatetime[0].startdate);
  const defaultenddate = parseISO(alldatetime[0].enddate);

  const rows = tdata3.querySelectorAll("tr");

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const stdate = inputs[0];
    const enddate = inputs[1];

    //  Fix logic: you had `if (!stdate || !enddate || !stdate.value || enddate.value) return`
    if (!stdate || !enddate || !stdate.value || !enddate.value) return;

    const newstdate = parseISO(stdate.value);
    const newenddate = parseISO(enddate.value);

    if (newstdate < defaultstartdate || newenddate > defaultenddate) {
      stdate.value = "";
      enddate.value = "";
    }
  });
  // validateDates(tr3);
}
//  Update the default time values and trigger validation
function updateIfReady() {
  if (
    startdataEl.value ||
    enddataEl.value ||
    starttimeEl.value ||
    endtimeEl.value
  ) {
    alldatetime.length = 0;
    alldatetime.push({
      startdate: startdataEl.value,
      enddate: enddataEl.value,
      starttime: starttimeEl.value,
      endtime: endtimeEl.value,
    });
    console.log("Updated datetime:", alldatetime[0]);
  }
}

//  Confirm and handle default start time change
starttimeEl.addEventListener("change", function () {
  if (hasAnyShowtimeRow()) {
    const confirmChange = confirm(
      "Changing default start time will clear alldaily showtimes u can refill them. Continue?"
    );
    if (confirmChange) {
      updateIfReady();
      clearAllDailyTimeInputs();
      previousStart = starttimeEl.value;
    } else {
      starttimeEl.value = previousStart;
    }
  } else {
    updateIfReady();
    previousStart = starttimeEl.value;
  }
});

//  Confirm and handle default end time change
endtimeEl.addEventListener("change", function () {
  if (hasAnyShowtimeRow()) {
    const confirmChange = confirm(
      "Changing default end time will clear alldaily showtimes u can refill them. Continue?"
    );
    if (confirmChange) {
      updateIfReady();
      clearAllDailyTimeInputs();
      previousEnd = endtimeEl.value;
    } else {
      endtimeEl.value = previousEnd;
    }
  } else {
    updateIfReady();
    previousEnd = endtimeEl.value;
  }
});

startdataEl.addEventListener("change", () => {
  if (hasAnyPricePlan()) {
    const confirmchange = confirm(
      "Changing default start date will clear all daily showtimes. You can refill them. Continue?"
    );
    if (confirmchange) {
      updateIfReady();
      clearalldate();
      perviousstartdate = startdataEl.value;
    } else {
      startdataEl.value = perviousstartdate;
    }
  } else {
    updateIfReady();
    perviousstartdate = startdataEl.value;
  }
});

enddataEl.addEventListener("change", () => {
  if (hasAnyPricePlan()) {
    const confirmchange = confirm(
      "Changing default end date will clear all daily showtimes. You can refill them. Continue?"
    );
    if (confirmchange) {
      updateIfReady();
      clearalldate();
      perviousenddate = enddataEl.value;
    } else {
      enddataEl.value = perviousenddate;
    }
  } else {
    updateIfReady();
    perviousenddate = enddataEl.value;
  }
});
function showtime() {
  const inputs = tdata.querySelectorAll("input");
  const name = inputs[0];
  const stime = inputs[1];
  const etime = inputs[2];
  console.log(name, stime, etime);
  // fetch(`http://localhost:3000/event/${eventId}`)
  // .then((response) => response.json())
  // .then((data) => {

  // })

  updateIfReady();

  if (alldatetime.length > 0 && alldatetime[0]) {
    const { startdate, enddate, starttime, endtime } = alldatetime[0];

    if (startdate && enddate && starttime && endtime) {
      const trEl = document.createElement("tr");

      // Name input
      const tdName = document.createElement("td");
      const nameEl = document.createElement("input");
      nameEl.type = "text";
      nameEl.placeholder = "Enter Your Show Name";
      tdName.appendChild(nameEl);
      trEl.appendChild(tdName);

      // Start Time input
      const tdStart = document.createElement("td");
      const startEl = document.createElement("input");
      startEl.type = "time";
      // startEl.setAttribute(
      //   "onkeydown",
      //   "return event.key < '0' || event.key > '9'"
      // );
      tdStart.appendChild(startEl);
      trEl.appendChild(tdStart);

      // End Time input
      const tdEnd = document.createElement("td");
      const endEl = document.createElement("input");
      endEl.type = "time";
      // endEl.setAttribute(
      //   "onkeydown",
      //   "return event.key < '0' || event.key > '9'"
      // );
      tdEnd.appendChild(endEl);
      trEl.appendChild(tdEnd);

      // Remove button
      const tdBtn = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.classList = "btn";
      removeBtn.textContent = "Remove";
      removeBtn.onclick = function () {
        const removedRow = this.closest("tr");
        const removedIndex = Array.from(tdata.querySelectorAll("tr")).indexOf(
          removedRow
        );
        console.log("removedIndex===========>", removedIndex);
        console.log("removedRow===========>", removedRow);
        // Remove matching showtime checkbox-label from all pricing plans
        tdata3.querySelectorAll("tr").forEach((planRow) => {
          const showtimestartEl = planRow.children[0];
          const showtimeTd = planRow.children[2]; // 3rd column (index 2)
          const allShowtimeDivs = showtimeTd.querySelectorAll(".show-ckeckbox");
          if (allShowtimeDivs[removedIndex]) {
            allShowtimeDivs[removedIndex].remove();
          }
        });
        removedRow.remove();
      };
      tdBtn.appendChild(removeBtn);
      trEl.appendChild(tdBtn);

      // Add to DOM
      tdata.appendChild(trEl);
      [nameEl, startEl, endEl].forEach((input) => {
        input.addEventListener("change", () => {
          validate(trEl);
        });
      });
      updateShowtime();
      // console.log("Tdata===========>", tdata.querySelectorAll("tr"));
      // console.log("tdata===========>", document.querySelectorAll("#tdata tr input"));
      // console.log("tdata===========>", tdata.querySelectorAll("input"));
      // tdata.querySelectorAll("tr").forEach((row) => {
      //   const inputs = row.querySelectorAll("input");
      //   const name = inputs[0];
      //   console.log("name===========>", name);
      // });
      // const eventmanagement = {
      //   showtimes: [],
      // };
      // tdata.querySelectorAll("tr").forEach((row) => {
      //   // const name = row.querySelector("input[type='text']").value;
      //   // const start = row.querySelector("input[type='time']").value;
      //   // const end = row.querySelector("input[type='time']").value;
      //   const inputs = row.querySelectorAll("input");

      //   const name = inputs[0].value;
      //   const start = inputs[1].value;
      //   const end = inputs[2].value;
      //   if (name && start && end) {
      //     eventmanagement.showtimes.push({
      //       name,
      //       starttime: start,
      //       endtime: end,
      //     });
      //   }
      //   console.log("eventmanagement===========>", eventmanagement);
      // });
    }
  }
}

function validate(row) {
  const inputs = row.querySelectorAll("input");
  const newstart = inputs[1].value;
  const newend = inputs[2].value;
  const basedate = new Date();

  const defaultStart = parse(alldatetime[0].starttime, "HH:mm", basedate);
  const defaultEnd = parse(alldatetime[0].endtime, "HH:mm", basedate);
  const newStartTime = parse(newstart, "HH:mm", basedate);
  const newEndTime = parse(newend, "HH:mm", basedate);
  //  Case 1: Start filled, End empty
  if (newstart && !newend) {
    // const newStartTime = parse(newstart, "HH:mm", basedate);
    if (
      isBefore(newStartTime, defaultStart) ||
      isAfter(newStartTime, defaultEnd) ||
      isEqual(newStartTime, defaultEnd)
    ) {
      alert(`Start time must be after: ${alldatetime[0].starttime}`);
      inputs[1].value = "";
      return;
    }
  }
  //  Case 2: End filled, Start empty
  if (!newstart && newend) {
    const basedate = new Date();

    // Parse default start and end
    const defaultStart = parse(alldatetime[0].starttime, "HH:mm", basedate);
    let defaultEnd = parse(alldatetime[0].endtime, "HH:mm", basedate);

    // If end is before start, it's on the next day (e.g., 22:00 to 01:00)
    if (isBefore(defaultEnd, defaultStart)) {
      defaultEnd.setDate(defaultEnd.getDate() + 1); // move to next day
    }

    // Parse newEndTime
    let newEndTime = parse(newend, "HH:mm", basedate);
    if (isBefore(newEndTime, defaultStart)) {
      newEndTime.setDate(newEndTime.getDate() + 1); // treat as next day
    }

    console.log("Default End:", defaultEnd);
    console.log("New End:", newEndTime);

    // Compare
    if (isAfter(newEndTime, defaultEnd) || isEqual(newEndTime, defaultStart)) {
      alert(`End time must be before: ${alldatetime[0].endtime}`);
      inputs[2].value = "";
      return;
    }
  }

  //  Case 3: Both empty → do nothing
  if (!newstart && !newend) return;

  if (newStartTime && newEndTime) {
    const defaultStart = parse(alldatetime[0].starttime, "HH:mm", basedate);
    let defaultEnd = parse(alldatetime[0].endtime, "HH:mm", basedate);

    // If end is before start, it's on the next day (e.g., 22:00 to 01:00)
    if (isBefore(defaultEnd, defaultStart)) {
      defaultEnd.setDate(defaultEnd.getDate() + 1); // move to next day
    }

    // Parse newEndTime
    let newEndTime = parse(newend, "HH:mm", basedate);
    if (isBefore(newEndTime, defaultStart)) {
      newEndTime.setDate(newEndTime.getDate() + 1); // treat as next day
    }
    if (newEndTime > defaultEnd) {
      alert(`End time must be before: ${alldatetime[0].endtime}`);
      inputs[2].value = "";
      return;
    }
  }

  //  Overlap check only if both values exist
  const rows = tdata.querySelectorAll("tr");
  for (let tr of rows) {
    if (tr === row) continue;

    const otherInputs = tr.querySelectorAll("input");
    const otherStart = parse(otherInputs[1].value, "HH:mm", basedate);
    const otherEnd = parse(otherInputs[2].value, "HH:mm", basedate);

    if (isValid(newStartTime) && !isValid(newEndTime)) {
      // Only warn if newStart is inside another time range
      if (
        (newStartTime > otherStart && newStartTime < otherEnd) ||
        isEqual(newStartTime, otherStart)
      ) {
        alert("This time range overlaps or touches another showtime.");
        inputs[1].value = "";
        return;
      }
    }

    if (isValid(newStartTime) && isValid(newEndTime)) {
      // Invalid if end before start or both equal
      if (
        newEndTime < newStartTime ||
        isEqual(newStartTime, newEndTime) ||
        newEndTime > defaultEnd
      ) {
        alert("Start and End cannot be same or reversed.");
        inputs[2].value = "";
        return;
      }

      // Check if this new range intersects with another
      if (
        (newStartTime < otherEnd && newEndTime > otherStart) ||
        isEqual(newEndTime, otherStart)
      ) {
        alert("This time range overlaps or touches another showtime.");
        // inputs[1].value = "";
        inputs[2].value = "";
        return;
      }
    }

    if (!isValid(newStartTime) && isValid(newEndTime)) {
      // If only end is given, and it overlaps another
      if (
        (newEndTime > otherStart && newEndTime < otherEnd) ||
        isEqual(newEndTime, otherStart)
      ) {
        alert("This time range overlaps or touches another showtime.");
        inputs[2].value = "";
        return;
      }
    }

    if (isEqual(newStartTime, otherEnd)) {
      alert("Start time and End time cannot be the same.");
      inputs[1].value = "";
      return;
    }
  }
}

addprice.addEventListener("click", () => {
  if (
    !startdataEl.value ||
    !enddataEl.value ||
    !starttimeEl.value ||
    !endtimeEl.value
  ) {
    alert(
      "Please fill in all fields (Start Date, End Date, Start Time, End Time) before adding another showtime."
    );
    return;
  }
  const lastRow = tdata.querySelector("tr:last-child");

  if (lastRow) {
    const inputs = lastRow.querySelectorAll("input");
    const nameVal = inputs[0]?.value.trim();
    const startVal = inputs[1]?.value;
    const endVal = inputs[2]?.value;

    if (!nameVal || !startVal || !endVal) {
      alert(
        "Please fill in all fields (Name, Start Time, End Time) before adding another showtime."
      );
      return;
    }
  }

  showtime();
});

function ticketcategory() {
  console.log("alldatetime =", JSON.stringify(alldatetime));

  const startdate = startdataEl.value;
  const enddate = enddataEl.value;
  const starttime = starttimeEl.value;
  const endtime = endtimeEl.value;

  if (!startdate || !enddate || !starttime || !endtime) {
    alert(
      "Please fill in Start Date, End Date, Start Time, and End Time before adding a ticket category."
    );
    return;
  }
  if (startdate && enddate && starttime && endtime) {
    const tr2 = document.createElement("tr");

    const tdcateName = document.createElement("td");
    const cateNameEl = document.createElement("input");
    cateNameEl.type = "text";
    cateNameEl.placeholder = "Enter your Show Category Name";
    tdcateName.append(cateNameEl);
    tr2.append(tdcateName);

    const tdcateprice = document.createElement("td");
    const priceEl = document.createElement("input");
    priceEl.type = "number";
    priceEl.placeholder = "Enter Your Ticket Price ₹";
    tdcateprice.append(priceEl);
    tr2.append(tdcateprice);

    const tdcatecount = document.createElement("td");
    const countEl = document.createElement("input");
    countEl.type = "number";
    countEl.placeholder = "Enter your Ticket Count";
    tdcatecount.append(countEl);
    tr2.append(tdcatecount);

    const tdcatebtn = document.createElement("td");
    const cateremoveBtn = document.createElement("button");
    cateremoveBtn.textContent = "Remove";
    cateremoveBtn.classList = "btn";
    cateremoveBtn.onclick = function () {
      const removedRow = this.closest("tr");
      const removedIndex = Array.from(tdata2.querySelectorAll("tr")).indexOf(
        removedRow
      );

      // Remove corresponding ticket category blocks in all pricing plan rows
      document.querySelectorAll("#tdata3 tr").forEach((planRow) => {
        const categoryTd = planRow.children[3]; // 4th column
        const allCategories = categoryTd.querySelectorAll(".pricing-showtime");
        if (allCategories[removedIndex]) {
          allCategories[removedIndex].remove();
        }
      });

      removedRow.remove();
    };

    tdcatebtn.append(cateremoveBtn);
    tr2.append(tdcatebtn);

    tdata2.appendChild(tr2);
    updateTicketCategory();
  }
  const eventmanagement = {
    ticketcategories: [],
  };
  tdata2.querySelectorAll("tr").forEach((row) => {
    // const cat = row.querySelector(".ticket-cat").value;
    // const price = row.querySelector(".ticket-price").value;
    // const count = row.querySelector(".ticket-count").value;
    const inputs = row.querySelectorAll("input");
    const cat = inputs[0].value;
    const price = inputs[1].value;
    const count = inputs[2].value;

    if (cat && price && count) {
      eventmanagement.ticketcategories.push({
        category: cat,
        price: price,
        count: count,
      });
    }
  });
  console.log("eventmanagement===========>", eventmanagement);
}

Addcategory.addEventListener("click", () => {
  const lastrows = document.querySelector("#tdata2 tr:last-child");
  console.log(lastrows);
  if (lastrows) {
    const input = lastrows.querySelectorAll("input");
    const cateNameEl = input[0]?.value.trim();
    const catepriceEl = input[1]?.value.trim();
    const catecountEl = input[2]?.value.trim();

    if (!cateNameEl || !catepriceEl || !catecountEl) {
      alert("please full all ticketcategory input after add new one");
      return;
    }
  }
  ticketcategory();
});

let i = 0;
let j = 0;

function pricingplans() {
  const allInputs = document.querySelectorAll('#tdata input[type="text"]');
  const timeinput = document.querySelectorAll('#tdata input[type="time"]');
  const hastimeinput = Array.from(timeinput).some(
    (input) => input.value === ""
  );
  const hasEmptyshow = Array.from(allInputs).some(
    (input) => input.value.trim() === ""
  );
  if (hastimeinput) {
    alert("please fill all showtime input");
    return;
  }
  if (hasEmptyshow) {
    alert("Please fill out all Name inputs before adding a pricing plan.");
    return;
  }

  const allticketinputs = document.querySelectorAll(
    "#tdata2 input[type='number']"
  );
  const hasEmptyticket = Array.from(allticketinputs).some(
    (input) => input.value.trim() === ""
  );

  if (hasEmptyticket) {
    alert(
      "Please fill out all ticket category inputs before adding a pricing plan."
    );
    return;
  }

  const tr3 = document.createElement("tr");

  const pricestartdatetdEl = document.createElement("td");
  const pricestartdatedivEl = document.createElement("div");
  const pricestartdateinput = document.createElement("input");
  pricestartdatedivEl.classList = "priceinput";
  pricestartdateinput.type = "date";
  pricestartdateinput.className = "startdate";
  pricestartdatedivEl.append(pricestartdateinput);
  pricestartdatetdEl.append(pricestartdatedivEl);
  // pricestartdateinput.name=priceenddateinput.value
  tr3.append(pricestartdatetdEl);

  const priceenddatatdEl = document.createElement("td");
  const priceenddatedivEl = document.createElement("div");
  const priceenddateinput = document.createElement("input");
  priceenddatedivEl.classList = "priceinput";
  priceenddateinput.type = "date";
  priceenddateinput.className = "enddate";
  priceenddatedivEl.append(priceenddateinput);
  priceenddatatdEl.append(priceenddatedivEl);
  // priceenddateinput.name=priceenddateinput.value
  tr3.append(priceenddatatdEl);

  const showtdEl = document.createElement("td");
  allInputs.forEach((el, index) => {
    const showdivEl = document.createElement("div");
    showdivEl.className = "show-ckeckbox";

    const showinputEl = document.createElement("input");
    showinputEl.type = "checkbox";
    showinputEl.id = `showtime${i}-${index}`;
    showinputEl.value = el.value;
    showinputEl.name = el.value;

    const showlabelEl = document.createElement("label");
    showlabelEl.htmlFor = `showtime${i}-${index}`;
    const labelId = `label-showtime${i}-${index}`;
    showlabelEl.id = labelId;
    showlabelEl.innerText = el.value || `Show ${index + 1}`;

    showdivEl.appendChild(showinputEl);
    showdivEl.appendChild(showlabelEl);
    showtdEl.appendChild(showdivEl);
  });
  tr3.append(showtdEl);

  const ticketcategorytdEl = document.createElement("td");
  const ticketRows = tdata2.querySelectorAll("tr");
  ticketRows.forEach((row, index) => {
    const inputs = row.querySelectorAll("input[type='text']");
    const numberinputs = row.querySelectorAll("input[type='number']");
    // if (inputs.length < 1) return;
    // if (numberinputs.length < 2) return;
    console.log("ticketcategorytdEl", numberinputs);
    const categoryName = inputs[0].value;
    const categoryPrice = numberinputs[0].value;
    const categoryCount = numberinputs[1].value;

    const ticketmaindivEl = document.createElement("div");
    ticketmaindivEl.classList = "pricing-showtime";

    const ticketfirstdivEl = document.createElement("div");
    const ticketfirstinputEl = document.createElement("input");
    ticketfirstinputEl.type = "checkbox";
    ticketfirstinputEl.value = categoryName;
    ticketfirstinputEl.name = categoryName;
    ticketfirstinputEl.id = `pricingplan${j}-${index}`;
    const ticketlabelEl = document.createElement("label");
    ticketlabelEl.htmlFor = `pricingplan${j}-${index}`;
    ticketlabelEl.innerText = categoryName;
    ticketfirstdivEl.append(ticketfirstinputEl, ticketlabelEl);

    const ticketseconddivEl = document.createElement("div");
    ticketseconddivEl.classList = "pricing-showtime-in";
    const ticketsecond1stinput = document.createElement("input");
    ticketsecond1stinput.type = "number";
    ticketsecond1stinput.value = categoryPrice;
    ticketsecond1stinput.name = categoryPrice;
    ticketsecond1stinput.placeholder = "Price";

    const ticketsecond2ndinput = document.createElement("input");
    ticketsecond2ndinput.type = "number";
    ticketsecond2ndinput.value = categoryCount;
    ticketsecond2ndinput.name = categoryCount;
    ticketsecond2ndinput.placeholder = "Count";

    ticketseconddivEl.append(ticketsecond1stinput, ticketsecond2ndinput);
    ticketmaindivEl.append(ticketfirstdivEl, ticketseconddivEl);
    ticketcategorytdEl.append(ticketmaindivEl);
  });
  tr3.append(ticketcategorytdEl);

  const removeTd = document.createElement("td");
  removeTd.innerHTML = `<button onclick="this.closest('tr').remove()" class="btn" >Remove</button>`;
  tr3.appendChild(removeTd);

  tdata3.appendChild(tr3);
  i++;
  j++;
  [pricestartdateinput, priceenddateinput].forEach((el) => {
    el.addEventListener("change", () => {
      validateDates(tr3);
    });
  });
  // const rows1 = tdata3.querySelectorAll("tr");
  // // const rows = tdata3.querySelectorAll("tr input[type='date']");
  // // const inputs=tdata3.querySelectorAll("tr input");
  // // const test = rows1.querySelectorAll("input");
  // // const showname=inputs[2]
  // // console.log("tdata3 input", rows);
  // // console.log("tdata3", rows1);
  // // console.log("tdata3", inputs);
  // // console.log("showname", showname);
  // // console.log9("tdata3", test);
  // tdata3.querySelectorAll("tr").forEach((planBlock) => {
  //   const inputs = planBlock.querySelectorAll("input");

  //   const start = inputs[0]?.value;
  //   const end = inputs[1]?.value;
  //   const shows = inputs[2].value;
  //   const cat = inputs[3].value;
  //   const price = inputs[4]?.value;
  //   const count = inputs[5]?.value;

  //   // console.log("All", start, end, shows, cat, price, count);
  //   console.log(inputs)
  //   console.log("shows========>",shows)
  //   console.log("cat==========>", cat);
  //   console.log("inputs==========>", inputs);
  // });

  // const planBlocks = tdata3.querySelectorAll("tr");
  // planBlocks.forEach((planBlock) => {
  //   const start = planBlock.querySelector("input.startdate")?.value;
  //   const end = planBlock.querySelector("input.enddate")?.value;

  //   const checkedShows = Array.from(
  //     planBlock.querySelectorAll("input[type='checkbox']")
  //   )
  //     .filter((cb) => cb.checked && cb.closest(".show-ckeckbox"))
  //     .map((cb) => cb.value);

  //   const ticketCategories = [];
  //   planBlock.querySelectorAll(".pricing-showtime").forEach((ticketBlock) => {
  //     const checkbox = ticketBlock.querySelector("input[type='checkbox']");
  //     const priceInput = ticketBlock.querySelector(
  //       ".pricing-showtime-in input:nth-child(1)"
  //     );
  //     const countInput = ticketBlock.querySelector(
  //       ".pricing-showtime-in input:nth-child(2)"
  //     );

  //     if (checkbox?.checked && priceInput && countInput) {
  //       ticketCategories.push({
  //         category: checkbox.value,
  //         price: priceInput.value,
  //         count: countInput.value,
  //         show: checkedShows.value,
  //       });
  //     }
  //   });

  //   // console.log("Start:", start);
  //   // console.log("End:", end);
  //   console.log("Shows:", checkedShows);
  //   // console.log("Tickets:", ticketCategories);
  //   console.log(ticketCategories);
  // });

  // pricestartdateinput.addEventListener("change", validateDates);
  // priceenddateinput.addEventListener("change", validateDates);
}
const validateDates = (tr3) => {
  const globalStart = startdataEl.value;
  const globalEnd = enddataEl.value;

  // console.log("globalStart, globalEnd", globalStart, globalEnd);
  const inputs = tr3.querySelectorAll("input[type='date']");
  const startVal = inputs[0].value;
  const endVal = inputs[1].value;
  const currentStart = parseISO(startVal);
  const currentEnd = parseISO(endVal);
  console.log("currentStart", currentStart);
  console.log("currentEnd", currentEnd);
  console.log("startVal, endVal", startVal, endVal);
  if (startVal && !endVal) {
    if (startVal < globalStart) {
      alert(
        `Start date cannot be before the event start date (${globalStart})`
      );
      inputs[0].value = "";
      return;
    }
    if (startVal > globalEnd) {
      alert(`Start date cannot be after the event end date (${globalEnd})`);
      inputs[0].value = "";
      return;
    }
  }
  if (!startVal && endVal) {
    if (endVal > globalEnd) {
      alert(`End date cannot be after the event end date (${globalEnd})`);
      inputs[1].value = "";
    }
    if (endVal < globalStart) {
      alert(`End date cannot be before the event start date (${globalStart})`);
      inputs[1].value = "";
    }
  }
  if (startVal && endVal) {
    if (startVal > endVal && endVal < startVal) {
      alert("Start date cannot be after end date.");
      // pricestartdateinput.value = "";
      inputs[1].value = "";
      return;
    }
  }
  if (startVal && endVal) {
    if (
      (startVal >= globalStart && endVal > globalEnd) ||
      (startVal >= globalStart && endVal < globalStart)
    ) {
      alert(
        `Start date cannot be before the event start date (${globalStart})`
      );
      inputs[1].value = "";
    }
  }

  const rows = tdata3.querySelectorAll("tr");
  for (const row of rows) {
    if (row === tr3) continue;
    const inputss = row.querySelectorAll("input[type='date']");
    const exStart = inputss[0]?.value;
    const exEnd = inputss[1]?.value;

    const existingStart = parseISO(exStart);
    const existingEnd = parseISO(exEnd);
    console.log("existingStart", existingStart);
    console.log("existingEnd", existingEnd);
    console.log(currentStart, "===", existingEnd);

    if (isValid(currentStart) && !isValid(currentEnd)) {
      if (currentStart >= existingStart && currentStart <= existingEnd) {
        alert("Date range overlaps with an existing pricing plan2.");
        inputs[0].value = "";
      }
    }
    if (!isValid(currentStart) && isValid(currentEnd)) {
      if (currentEnd <= existingEnd && currentEnd >= existingStart) {
        alert("Date range overlaps with an existing pricing plan3.");
        inputs[1].value = "";
      }
    }
    if (isValid(currentStart) && isValid(currentEnd)) {
      if (
        (currentStart > existingEnd && currentEnd <= existingEnd) ||
        (currentEnd > existingStart && currentEnd < existingEnd) ||
        (currentStart < existingStart && currentEnd >= existingEnd)
      ) {
        alert("Date range overlaps with an existing pricing plan4.");
        inputs[1].value = "";
      } else if (currentEnd > existingEnd && currentStart <= existingEnd) {
        alert("Date range overlaps with an existing pricing plan8.");
        inputs[0].value = "";
      }
    }
    if (isEqual(currentEnd, existingStart)) {
      alert("Date range overlaps with an existing pricing plan7.");
      inputs[1].value = "";
    }
  }
};

addpriceplan.addEventListener("click", () => {
  if (
    !startdataEl.value ||
    !enddataEl.value ||
    !starttimeEl.value ||
    !endtimeEl.value
  )
    return;
  const showtimedataEl = tdata.querySelectorAll("input[type='text']");
  if (!showtimedataEl.length) return;
  const ticketname = tdata2.querySelectorAll("input[type='number']");
  const ticketpricecount = tdata2.querySelectorAll("input[type='text']");
  if (!ticketname.length || !ticketpricecount.length) return;

  const lastrow = document.querySelector("#tdata3 tr:last-child");

  if (lastrow) {
    const inputs = lastrow.querySelectorAll("input[type='date']");
    const startdate = inputs[0]?.value;
    const enddate = inputs[1]?.value;

    if (!startdate || !enddate) {
      alert("please fill pervious start and end date after add new one");
      return;
    }
  }
  pricingplans();
});

function updateShowtime() {
  const allShowtimeInputs = document.querySelectorAll(
    '#tdata input[type="text"]'
  ); // all showtime names
  const pricingPlanRows = document.querySelectorAll("#tdata3 tr"); // all pricing plan rows

  pricingPlanRows.forEach((row, rowIndex) => {
    const showtimeTd = row.children[2]; // 3rd <td> is for showtimes

    allShowtimeInputs.forEach((el, index) => {
      const showLabelText = el.value || `Showtime ${index + 1}`;

      //  Check if label with this showtime already exists
      const alreadyExists = Array.from(
        showtimeTd.querySelectorAll("label")
      ).some((label) => label.innerText === showLabelText);

      if (!alreadyExists) {
        const showDiv = document.createElement("div");
        showDiv.className = "show-ckeckbox";

        const checkboxId = `showtime-${rowIndex}-${index}`;
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = showLabelText;
        input.id = checkboxId;
        input.value = showLabelText; //  So we get correct value later

        const label = document.createElement("label");
        label.htmlFor = checkboxId;
        label.innerText = showLabelText;

        //  Sync label text if original input changes
        el.addEventListener("input", () => {
          const newValue = el.value || `Showtime ${index + 1}`;
          label.innerText = newValue;
          input.value = newValue;
        });

        showDiv.appendChild(input);
        showDiv.appendChild(label);
        showtimeTd.appendChild(showDiv);
      }
    });
  });
}
function updateTicketCategory() {
  const categoryRows = document.querySelectorAll("#tdata2 tr"); // All ticket category rows
  const pricingPlanRows = document.querySelectorAll("#tdata3 tr"); // All pricing plan rows

  pricingPlanRows.forEach((row, rowIndex) => {
    const categoryTd = row.children[3]; // 4th column in pricing plan

    categoryRows.forEach((catRow, catIndex) => {
      const inputs = catRow.querySelectorAll('input[type="text"]');
      const numberinputs = catRow.querySelectorAll('input[type="number"]');

      console.log("numberinputs", numberinputs);
      const nameInput = inputs[0]; // Category name
      // const price1Input = inputs[1]; // Price
      // const price2Input = inputs[2]; // Count
      const price1Input = numberinputs[0]; // Count
      const price2Input = numberinputs[1];

      if (!nameInput) return;

      const checkboxId = `cat-${rowIndex}-${catIndex}`;
      const currentLabel = nameInput.value.trim() || `Category ${catIndex + 1}`;

      //  Check if label with same text already exists in this pricing plan row
      const existingLabels = Array.from(
        categoryTd.querySelectorAll("label")
      ).map((l) => l.innerText.trim());
      if (existingLabels.includes(currentLabel)) return;

      // Create checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = currentLabel;
      checkbox.value = nameInput.value;
      checkbox.id = checkboxId;
      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.innerText = currentLabel;

      // Sync label text when category name changes
      nameInput.addEventListener("input", () => {
        label.innerText = nameInput.value.trim() || `Category ${catIndex + 1}`;
        checkbox.value = nameInput.value;
      });

      // Wrap checkbox + label
      const checkboxLabelDiv = document.createElement("div");
      checkboxLabelDiv.appendChild(checkbox);
      checkboxLabelDiv.appendChild(label);

      // Create corresponding price inputs
      const priceInput1 = document.createElement("input");
      priceInput1.type = "number";
      priceInput1.value = price1Input?.value || "";

      const priceInput2 = document.createElement("input");
      priceInput2.type = "number";
      priceInput2.value = price2Input?.value || "";

      // Sync ticket category -> pricing plan (one-way sync)
      if (price1Input) {
        price1Input.addEventListener("input", () => {
          priceInput1.value = price1Input.value;
        });
      }

      if (price2Input) {
        price2Input.addEventListener("input", () => {
          priceInput2.value = price2Input.value;
        });
      }

      // Wrap price inputs
      const innerDiv = document.createElement("div");
      innerDiv.className = "pricing-showtime-in";
      innerDiv.appendChild(priceInput1);
      innerDiv.appendChild(priceInput2);

      // Final wrapper for entire category
      const wrapDiv = document.createElement("div");
      wrapDiv.className = "pricing-showtime";
      wrapDiv.appendChild(checkboxLabelDiv);
      wrapDiv.appendChild(innerDiv);

      // Append to the pricing plan cell
      categoryTd.appendChild(wrapDiv);
      console.log("checkbox=====>", checkbox.name);
      console.log("checkbox=====>", checkbox.value);
    });
  });
}

function submitEvent() {
  const theaternameEl = thearterinput.value.trim();

  if (
    tdata.querySelectorAll("tr").length === 0 ||
    tdata2.querySelectorAll("tr").length === 0 ||
    tdata3.querySelectorAll("tr").length === 0
  ) {
    alert(
      "Please add at least one showtime, ticket category and pricing plan."
    );
    return;
  }

  const eventmanagement = {

    eventdefaultstartandend: {
      name: theaternameEl,
      startdate: startdataEl.value,
      enddate: enddataEl.value,
      starttime: starttimeEl.value,
      endtime: endtimeEl.value,
    },
    showtimes: [],
    ticketcategories: [],
    pricingplans: [],
  };

  for (const row of tdata.querySelectorAll("tr")) {
    const inputs = row.querySelectorAll("input");
    const name = inputs[0]?.value.trim();
    const start = inputs[1]?.value.trim();
    const end = inputs[2]?.value.trim();

    if (!name || !start || !end) {
      alert("Please fill name, start time and end time in all showtimes.");
      return;
    }

    eventmanagement.showtimes.push({

      name,
      starttime: start,
      endtime: end,
    });
  }

  for (const row of tdata2.querySelectorAll("tr")) {
    const inputs = row.querySelectorAll("input");
    const cat = inputs[0]?.value.trim();
    const price = inputs[1]?.value.trim();
    const count = inputs[2]?.value.trim();

    if (!cat || !price || !count) {
      alert(
        "Please fill out category, price, and count in all ticket categories."
      );
      return;
    }

    eventmanagement.ticketcategories.push({

      category: cat,
      price,
      count,
    });
  }

  for (const planBlock of tdata3.querySelectorAll("tr")) {
    const startInput = planBlock.querySelector("input.startdate");
    const endInput = planBlock.querySelector("input.enddate");
    const start = startInput?.value;
    const end = endInput?.value;

    const shows = [];
    const showcheckboxes = planBlock.querySelectorAll(
      ".show-ckeckbox input[type='checkbox']"
    );

    showcheckboxes.forEach((cb) => {
      shows.push({
        showname: cb.value,
        shownamestatus: cb.checked,
      });
    });

    const tickets = [];
    const ticketBlocks = planBlock.querySelectorAll(".pricing-showtime");
    for (const ticketBlock of ticketBlocks) {
      const checkbox = ticketBlock.querySelector("input[type='checkbox']");
      const priceInput = ticketBlock.querySelector(
        ".pricing-showtime-in input:nth-child(1)"
      );
      const countInput = ticketBlock.querySelector(
        ".pricing-showtime-in input:nth-child(2)"
      );

      if (!checkbox.value) {
        alert("no value here");
        return;
      }

      if (checkbox && priceInput && countInput) {
        tickets.push({
          category: checkbox.value,
          price: priceInput.value,
          count: countInput.value,
          catecheck: checkbox.checked,
        });
      }
    }

    const hasCheckedShow = shows.some((s) => s.shownamestatus === true);
    const hasCheckedTicket = tickets.some((t) => t.catecheck === true);

    if (!start || !end || !hasCheckedShow || !hasCheckedTicket) {
      alert(
        "Please fill required data in pricing plan (at least one checked show and ticket)."
      );
      return;
    }

    eventmanagement.pricingplans.push({
      startdate: start,
      enddate: end,
      shows,
      tickets,
    });
  }

  // if (theaternameEl && !theaternamearrEll.includes(theaternameEl)) {
  //   theaternamearrEll.push(theaternameEl);
  //   const option = document.createElement("option");
  //   option.value = theaternameEl;
  //   option.innerText = theaternameEl;
  //   selects.appendChild(option);
  // }

  //  set the dropdown to the newly added/select value


  fetch("http://localhost:3000/event/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventmanagement),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log("Event created successfully:", res);
      alert("Saved successfully");

      //  Add the new event to the select dropdown with proper ID
      const option = document.createElement("option");
      option.value = res.event_id; // Set numeric ID
      option.textContent = theaternameEl || theaternameEl;
      selects.appendChild(option);

      // Auto-select the newly created option
      selects.value = res.event_id;
    })
    .catch((err) => {
      console.error("Error submitting event:", err);
      alert("Failed to save event");
    })
    .finally(() => {
      console.log("**********************", eventmanagement);
    });

  // thearterinput.value = "";
  console.log("//////////////=====>", eventmanagement);
}

updatebtn.addEventListener("click", submitEvent);

// fetch(`http://localhost:3000/events/${eventId}`)
//   .then((res) => res.json())
//   .then((data) => {
//     console.log("Loaded event data:", data);

//     const showtimeSelect = document.getElementById("");
//     showtimeSelect.innerHTML = `<option value="">-- Select Showtime --</option>`; // Reset

//     if (Array.isArray(data.showtimes)) {
//       data.showtimes.forEach((show) => {
//         const option = document.createElement("option");
//         option.value = show.id; // or show.name
//         option.textContent = `${show.name} (${show.starttime} - ${show.endtime})`;
//         showtimeSelect.appendChild(option);
//       });
//     } else {
//       console.warn("No showtimes found for event", eventId);
//     }
//   })
//   .catch((err) => {
//     console.error("Error loading event data:", err);
//   });

// Populate the theater dropdown with all events  // Load all theaters into dropdown on page load
async function populateTheaterDropdown() {
  try {
    const res = await fetch("http://localhost:3000/event");
    const data = await res.json();

    const select = document.getElementById("theaterSelect");
    select.innerHTML = `<option value="">Select Theater</option>`; // Reset

    data.forEach((event) => {
      const option = document.createElement("option");
      option.value = event.id; // Use event ID
      option.textContent = event.thearter_name; // Display name
      select.appendChild(option);
    });

    // Attach onchange handler
    select.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      loadEventDetails(selectedId);
    });

  } catch (err) {
    console.error("Failed to load events:", err);
  }
}


// Load full event details for selected event ID
function loadEventDetails(eventId) {
  if (!eventId) return;

  fetch(`http://localhost:3000/event/${eventId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Full event data:", data);
      const { event, showtimes, ticketcategories, pricingplans } = data;
      document.getElementById("startDate").value = event.startdate;
      document.getElementById("endDate").value = event.enddate;
      document.getElementById("startTime").value = event.starttime;
      document.getElementById("endTime").value = event.endtime;

      const tdata = document.getElementById("tdata");
      tdata.innerHTML = "";
      showtimes.forEach((show) => {
        const trEl = document.createElement("tr");
        const tdName = document.createElement("td");
        const nameEl = document.createElement("input");
        nameEl.type = "text";
        nameEl.value = show.name;
        tdName.appendChild(nameEl);
        trEl.appendChild(tdName);

        const tdStart = document.createElement("td");
        const startEl = document.createElement("input");
        startEl.type = "time";
        startEl.value = show.starttime;
        tdStart.appendChild(startEl);
        trEl.appendChild(tdStart);

        const tdEnd = document.createElement("td");
        const endEl = document.createElement("input");
        endEl.type = "time";
        endEl.value = show.endtime;
        tdEnd.appendChild(endEl);
        trEl.appendChild(tdEnd);

        const tdBtn = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.classList = "btn";
        removeBtn.textContent = "Remove";
        removeBtn.onclick = function () {
          const removedRow = this.closest("tr");
          const removedIndex = Array.from(tdata.querySelectorAll("tr")).indexOf(
            removedRow
          );
          // Remove matching showtime checkbox-label from all pricing plans
          tdata3.querySelectorAll("tr").forEach((planRow) => {
            const showtimestartEl = planRow.children[0];
            const showtimeTd = planRow.children[2]; // 3rd column (index 2)
            const allShowtimeDivs = showtimeTd.querySelectorAll(".show-ckeckbox");
            if (allShowtimeDivs[removedIndex]) {
              allShowtimeDivs[removedIndex].remove();
            }
          });
          removedRow.remove();
        };
        tdBtn.appendChild(removeBtn);
        trEl.appendChild(tdBtn);

        // Add to DOM
        tdata.appendChild(trEl);
      });

      const tdata2 = document.getElementById("tdata2");
      tdata2.innerHTML = "";
      ticketcategories.forEach((cat) => {
        const tr = document.createElement("tr");
        tr.dataset.id = cat.id;
        const tdCat = document.createElement("td");
        const catEl = document.createElement("input");
        catEl.type = "text";
        catEl.value = cat.category;
        tdCat.appendChild(catEl);
        tr.appendChild(tdCat);

        const tdPrice = document.createElement("td");
        const priceEl = document.createElement("input");
        priceEl.type = "number";
        priceEl.value = cat.price;
        tdPrice.appendChild(priceEl);
        tr.appendChild(tdPrice);

        const tdCount = document.createElement("td");
        const countEl = document.createElement("input");
        countEl.type = "number";
        countEl.value = cat.count;
        tdCount.appendChild(countEl);
        tr.appendChild(tdCount);


        const tdcatebtn = document.createElement("td");
        const cateremoveBtn = document.createElement("button");
        cateremoveBtn.textContent = "Remove";
        cateremoveBtn.classList = "btn";
        cateremoveBtn.onclick = function () {
          const removedRow = this.closest("tr");
          const removedIndex = Array.from(tdata2.querySelectorAll("tr")).indexOf(
            removedRow
          );

          // Remove corresponding ticket category blocks in all pricing plan rows
          document.querySelectorAll("#tdata3 tr").forEach((planRow) => {
            const categoryTd = planRow.children[3]; // 4th column
            const allCategories = categoryTd.querySelectorAll(".pricing-showtime");
            if (allCategories[removedIndex]) {
              allCategories[removedIndex].remove();
            }
          });

          removedRow.remove();
        };

        tdcatebtn.append(cateremoveBtn);
        tr.append(tdcatebtn);

        tdata2.appendChild(tr);
      });

      const tdata3 = document.getElementById("tdata3");
      tdata3.innerHTML = "";
      pricingplans.forEach((plan, i) => {
        const tr3 = document.createElement("tr");

        const pricestartdatetdEl = document.createElement("td");
        const pricestartdatedivEl = document.createElement("div");
        const pricestartdateinput = document.createElement("input");
        pricestartdatedivEl.classList = "priceinput";
        pricestartdateinput.type = "date";
        pricestartdateinput.className = "startdate";
        pricestartdateinput.value = plan.startdate.split("T")[0];
        pricestartdatedivEl.append(pricestartdateinput);
        pricestartdatetdEl.append(pricestartdatedivEl);
        tr3.append(pricestartdatetdEl);

        const priceenddatatdEl = document.createElement("td");
        const priceenddatedivEl = document.createElement("div");
        const priceenddateinput = document.createElement("input");
        priceenddatedivEl.classList = "priceinput";
        priceenddateinput.type = "date";
        priceenddateinput.className = "enddate";
        priceenddateinput.value = plan.enddate.split("T")[0];
        priceenddatedivEl.append(priceenddateinput);
        priceenddatatdEl.append(priceenddatedivEl);
        tr3.append(priceenddatatdEl);

        const showtdEl = document.createElement("td");
        showtimes.forEach((show, si) => {
          const showdivEl = document.createElement("div");
          showdivEl.className = "show-ckeckbox";

          const showinputEl = document.createElement("input");
          showinputEl.type = "checkbox";
          showinputEl.id = `showtime${i}-${si}`;
          showinputEl.value = show.name;
          showinputEl.name = show.name;

          const matchedShow = plan.shows.find(s => s.showtime_id === show.id);
          if (matchedShow && matchedShow.shownamestatus === 1) {
            showinputEl.checked = true;
          }

          const showlabelEl = document.createElement("label");
          showlabelEl.htmlFor = `showtime${i}-${si}`;
          showlabelEl.id = `label-showtime${i}-${si}`;
          showlabelEl.innerText = show.name;

          showdivEl.appendChild(showinputEl);
          showdivEl.appendChild(showlabelEl);
          showtdEl.appendChild(showdivEl);
        });
        tr3.append(showtdEl);

        const ticketcategorytdEl = document.createElement("td");
        ticketcategories.forEach((cat, j) => {
          const ticketmaindivEl = document.createElement("div");
          ticketmaindivEl.className = "pricing-showtime";

          const ticketfirstdivEl = document.createElement("div");
          const ticketfirstinputEl = document.createElement("input");
          ticketfirstinputEl.type = "checkbox";
          ticketfirstinputEl.value = cat.category;
          ticketfirstinputEl.name = cat.category;
          ticketfirstinputEl.id = `pricingplan${i}-${j}`;

          const matchedCat = plan.tickets.find(t => t.category_id === cat.id);
          if (matchedCat && matchedCat.catecheck === 1) {
            ticketfirstinputEl.checked = true;
          }

          const ticketlabelEl = document.createElement("label");
          ticketlabelEl.htmlFor = `pricingplan${i}-${j}`;
          ticketlabelEl.innerText = cat.category;
          ticketfirstdivEl.append(ticketfirstinputEl, ticketlabelEl);

          const ticketseconddivEl = document.createElement("div");
          ticketseconddivEl.className = "pricing-showtime-in";
          const ticketsecond1stinput = document.createElement("input");
          ticketsecond1stinput.type = "number";
          ticketsecond1stinput.value = plan.price;
          ticketsecond1stinput.placeholder = "Price";

          const ticketsecond2ndinput = document.createElement("input");
          ticketsecond2ndinput.type = "number";
          ticketsecond2ndinput.value = plan.count;
          ticketsecond2ndinput.placeholder = "Count";

          ticketseconddivEl.append(ticketsecond1stinput, ticketsecond2ndinput);
          ticketmaindivEl.append(ticketfirstdivEl, ticketseconddivEl);
          ticketcategorytdEl.append(ticketmaindivEl);
        });
        tr3.append(ticketcategorytdEl);

        const removeTd = document.createElement("td");
        removeTd.innerHTML = `<button onclick="this.closest('tr').remove()" class="btn">Remove</button>`;
        tr3.appendChild(removeTd);

        tdata3.appendChild(tr3);
      });
    })


    .catch((err) => console.error("Error loading event details:", err));
}

// Initial load
populateTheaterDropdown();


// function updateEvent(eventId) {
//   const eventdefaultstartandend = getEventInputs();       // Collect event details
//   const showtimes = getAllShowtimes();                    // Collect all current showtime rows
//   const ticketcategories = getAllTicketCategories();      // Collect ticket category rows
//   const pricingplans = getAllPricingPlans();              // Collect pricing plan rows
// 
//   fetch(`http://localhost:3000/event/${eventId}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       eventdefaultstartandend,
//       showtimes,
//       ticketcategories,
//       pricingplans
//     })
//   })
//     .then(res => res.json())
//     .then(data => {
//       console.log("Updated successfully:", data);
// 
//       // 👇 Call sync delete right after update success
//       syncDeleteEvent(eventId, showtimes, ticketcategories, pricingplans);
//     })
//     .catch(err => {
//       console.error("Update failed:", err);
//     });
// }
// function getAllShowtimes() {
//   const rows = document.querySelectorAll("#tdata tr");
//   return Array.from(rows).map(row => {
//     const inputs = row.querySelectorAll("input");
//     return {
//       name: inputs[0].value.trim(),
//       starttime: inputs[1].value.trim(),
//       endtime: inputs[2].value.trim()
//     };
//   });
// }
// function getAllTicketCategories() {
//   const rows = document.querySelectorAll("#tdata2 tr");
//   return Array.from(rows).map(row => {
//     const textInput = row.querySelector("input[type='text']");
//     const numberInputs = row.querySelectorAll("input[type='number']");
//     return {
//       category: textInput.value.trim(),
//       price: parseFloat(numberInputs[0].value),
//       count: parseInt(numberInputs[1].value)
//     };
//   });
// }
// function getAllPricingPlans() {
//   const rows = document.querySelectorAll("#tdata3 tr");
// 
//   return Array.from(rows).map(row => {
//     const startdate = row.querySelector("input.startdate").value;
//     const enddate = row.querySelector("input.enddate").value;
// 
//     // Show checkboxes
//     const shows = Array.from(row.querySelectorAll(".show-ckeckbox input")).map(input => ({
//       showname: input.value,
//       shownamestatus: input.checked ? 1 : 0
//     }));
// 
//     // Ticket category checkboxes + inputs
//     const ticketDivs = row.querySelectorAll(".pricing-showtime");
//     const tickets = Array.from(ticketDivs).map(div => {
//       const checkbox = div.querySelector("input[type='checkbox']");
//       const inputs = div.querySelectorAll(".pricing-showtime-in input");
//       return {
//         category: checkbox.value,
//         catecheck: checkbox.checked ? 1 : 0,
//         price: parseFloat(inputs[0].value),
//         count: parseInt(inputs[1].value)
//       };
//     });
// 
//     return {
//       startdate,
//       enddate,
//       shows,
//       tickets
//     };
//   });
// }
const ReUpdate=document.getElementById("ReUpdate");
ReUpdate.addEventListener("click",updateEvent);
// async function displaydefaultdateandtime(){
//   const data=await fetch(`http://localhost:3000/event/1`);
//   const res=await data.json();
//  console.log(res);

// }
// displaydefaultdateandtime()

// let allEvents = [];

// async function loadAllEvents() {
//   try {
//     const res = await fetch("http://localhost:3000/events/all");
//     allEvents = await res.json();
//     populateTheaterDropdown(allEvents);
//   } catch (err) {
//     console.error("Error loading events:", err);
//   }
// }

// function populateTheaterDropdown(events) {
//   const select = document.getElementById("theaterSelect");
//   // select.innerHTML = `<option value="">Select Theater</option>`; // Reset

//   events.forEach((e) => {
//     const opt = document.createElement("option");
//     opt.value = e.event.id; //  FIX: use event.id
//     opt.textContent = e.event.thearter_name;
//     select.appendChild(opt);
//   });
// }

// const select = document.getElementById("theaterSelect"); //  FIX: correctly define 'selects'
// select.addEventListener("change", (e) => {
//   const eventId = +e.target.value;
//   const eventData = allEvents.find((e) => e.event.id === eventId);
//   console.log("eventdatta*******>", eventData);
//   console.log("eventId*******>", eventId);
//   if (eventData) {
//     fillEventForm(eventData);
//   }
// });

// function fillEventForm(data) {
//   const { event, showtimes, ticketcategories, pricingplans } = data;
//   console.log("prircingplans", pricingplans);
//   console.log("");
//   document.getElementById("startDate").value = event.startdate;
//   document.getElementById("endDate").value = event.enddate;
//   document.getElementById("startTime").value = event.starttime;
//   document.getElementById("endTime").value = event.endtime;

//   const tdata = document.getElementById("tdata");
//   tdata.innerHTML = "";
//   showtimes.forEach((show) => {
//     const trEl = document.createElement("tr");
//     trEl.dataset.id = show.id;
//     const tdName = document.createElement("td");
//     const nameEl = document.createElement("input");
//     nameEl.type = "text";
//     nameEl.value = show.name;
//     tdName.appendChild(nameEl);
//     trEl.appendChild(tdName);

//     const tdStart = document.createElement("td");
//     const startEl = document.createElement("input");
//     startEl.type = "time";
//     startEl.value = show.starttime;
//     tdStart.appendChild(startEl);
//     trEl.appendChild(tdStart);

//     const tdEnd = document.createElement("td");
//     const endEl = document.createElement("input");
//     endEl.type = "time";
//     endEl.value = show.endtime;
//     tdEnd.appendChild(endEl);
//     trEl.appendChild(tdEnd);

//     const tdBtn = document.createElement("td");
//     const removeBtn = document.createElement("button");
//     removeBtn.classList = "btn";
//     removeBtn.textContent = "Remove";
//     removeBtn.onclick = function () {
//       this.closest("tr").remove();
//       rebuildAllPricingRows();
//     };
//     tdBtn.appendChild(removeBtn);
//     trEl.appendChild(tdBtn);

//     tdata.appendChild(trEl);
//   });

//   const tdata2 = document.getElementById("tdata2");
//   tdata2.innerHTML = "";
//   ticketcategories.forEach((cat) => {
//     const tr = document.createElement("tr");
//     tr.dataset.id = cat.id;
//     const tdCat = document.createElement("td");
//     const catEl = document.createElement("input");
//     catEl.type = "text";
//     catEl.value = cat.category;
//     tdCat.appendChild(catEl);
//     tr.appendChild(tdCat);

//     const tdPrice = document.createElement("td");
//     const priceEl = document.createElement("input");
//     priceEl.type = "number";
//     priceEl.value = cat.price;
//     tdPrice.appendChild(priceEl);
//     tr.appendChild(tdPrice);

//     const tdCount = document.createElement("td");
//     const countEl = document.createElement("input");
//     countEl.type = "number";
//     countEl.value = cat.count;
//     tdCount.appendChild(countEl);
//     tr.appendChild(tdCount);

//     const tdBtn = document.createElement("td");
//     const removeBtn = document.createElement("button");
//     removeBtn.classList = "btn";
//     removeBtn.textContent = "Remove";
//     removeBtn.onclick = function () {
//       this.closest("tr").remove();
//       rebuildAllPricingRows();
//     };
//     tdBtn.appendChild(removeBtn);
//     tr.appendChild(tdBtn);

//     tdata2.appendChild(tr);
//   });

//   const tdata3 = document.getElementById("tdata3");
//   tdata3.innerHTML = "";
//   pricingplans.forEach((plan) => {
//     const tr = document.createElement("tr");
//     tr.dataset.id = plan.id;
//     const tdStart = document.createElement("td");
//     const startInput = document.createElement("input");
//     const startdiv = document.createElement("div");
//     startdiv.className = "priceinput";
//     startInput.type = "date";
//     startInput.value = plan.startdate;
//     startdiv.appendChild(startInput);
//     tdStart.appendChild(startdiv);
//     tr.appendChild(tdStart);

//     const tdEnd = document.createElement("td");
//     const endInput = document.createElement("input");
//     const enddiv = document.createElement("div");
//     enddiv.className = "priceinput";
//     endInput.type = "date";
//     endInput.value = plan.enddate;
//     enddiv.appendChild(endInput);
//     tdEnd.appendChild(enddiv);
//     tr.appendChild(tdEnd);

//     const tdShows = document.createElement("td");
//     tdShows.classList.add("showtime-cell");
//     tr.appendChild(tdShows);

//     const tdTickets = document.createElement("td");
//     tdTickets.classList.add("ticket-cell");
//     tr.appendChild(tdTickets);

//     const tdBtn = document.createElement("td");
//     const removeBtn = document.createElement("button");
//     removeBtn.classList = "btn";
//     removeBtn.textContent = "Remove";
//     removeBtn.onclick = function () {
//       this.closest("tr").remove();
//     };
//     tdBtn.appendChild(removeBtn);
//     tr.appendChild(tdBtn);

//     tr.dataset.shows = JSON.stringify(plan.shows);
//     tr.dataset.tickets = JSON.stringify(plan.tickets);

//     console.log((tr.dataset.tickets = JSON.stringify(plan.tickets)));
//     console.log((tr.dataset.shows = JSON.stringify(plan.shows)));
//     tdata3.appendChild(tr);
//   });

//   rebuildAllPricingRows();
// }

// function rebuildAllPricingRows() {
//   const tdata3 = document.getElementById("tdata3");

//   const showNames = Array.from(
//     document.querySelectorAll("#tdata tr input[type='text']")
//   )
//     .map((el) => el.value.trim())
//     .filter((v) => v);

//   const categoryNames = Array.from(
//     document.querySelectorAll("#tdata2 tr input[type='text']")
//   )
//     .map((el) => el.value.trim())
//     .filter((v) => v);
//   console.log("categoryNames", categoryNames);
//   tdata3.querySelectorAll("tr").forEach((row) => {
//     const showContainer = row.querySelector(".showtime-cell");
//     const ticketContainer = row.querySelector(".ticket-cell");
//     showContainer.innerHTML = "";
//     ticketContainer.innerHTML = "";

//     const originalShows = JSON.parse(row.dataset.shows || "[]");
//     const originalTickets = JSON.parse(row.dataset.tickets || "[]");
//     console.log("originalShows", originalShows);
//     console.log("originalTickets", originalTickets);

//     showNames.forEach((name) => {
//       const data = originalShows.find((s) => s.showname === name) || {};
//       const div = document.createElement("div");
//       div.classList.add("show-ckeckbox");
//       if (data.id) div.dataset.id = data.id;
//       div.innerHTML = `
//         <input type="checkbox" value="${name}" ${
//         data.shownamestatus ? "checked" : ""
//       } />
//         <label>${name}</label>
//       `;
//       showContainer.appendChild(div);
//       console.log(data.shownamestatus);
//     });
//     categoryNames.forEach((cat) => {
//       console.log("cat", cat);
//       const data = originalTickets.find((t) => t.category === cat) || {};
//       const div = document.createElement("div");
//       div.classList.add("pricing-showtime");
//       if (data.id) div.dataset.id = data.id;
//       div.innerHTML = `
//         <div>
//           <input type="checkbox" value="${cat}" ${
//         data.catecheck ? "checked" : ""
//       } />
//           <label>${cat}</label>
//         </div>
//         <div class="pricing-showtime-in">
//           <input type="text" value="${data.price || ""}" />
//           <input type="text" value="${data.count || ""}" />
//         </div>
//       `;
//       ticketContainer.appendChild(div);
//       console.log("catecheck", data.catecheck);
//     });
//   });
// }

// async function updateEvent(eventId, data) {
//   try {
//     const response = await fetch(`http://localhost:3000/event/api/${eventId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to update event");
//     }

//     const result = await response.json();
//     console.log("Event updated successfully:", result);
//     alert("Event updated successfully!");
//   } catch (error) {
//     console.error("Update failed:", error);
//     alert("Error updating event.");
//   }
// }
// const ReUpdate = document.getElementById("ReUpdate");

// ReUpdate.addEventListener("click", () => {
//   const inputs = tdata.querySelectorAll("input");
//   const name = inputs[0].value;
//   const stime = inputs[1].value;
//   const etime=inputs[2].value;

//   console.log(inputs);
//   if (name && stime && etime) {
//     const select = document.getElementById("theaterSelect");
//     const eventId = parseInt(select.value, 10); // should be numeric ID
//     console.log("eventId", eventId);
//     if (!eventId || isNaN(eventId)) {
//       alert("Please select an event to update.");
//       return;
//     }

//     const data = collectUpdatedFormData();
//     updateEvent(eventId, data);
//   }
//   else {
//     alert("Please fill all showtime fields before updating");
//   }
// });

// function collectUpdatedFormData() {
//   const showtimes = Array.from(document.querySelectorAll("#tdata tr")).map(
//     (tr) => {
//       const inputs = tr.querySelectorAll("input");
//       return {
//         ...(tr.dataset.id ? { id: Number(tr.dataset.id) } : {}),
//         name: inputs[0].value,
//         starttime: inputs[1].value,
//         endtime: inputs[2].value,
//       };
//     }
//   );

//   const ticketcategories = Array.from(
//     document.querySelectorAll("#tdata2 tr")
//   ).map((tr) => {
//     const inputs = tr.querySelectorAll("input");
//     return {
//       ...(tr.dataset.id ? { id: Number(tr.dataset.id) } : {}),
//       category: inputs[0].value,
//       price: Number(inputs[1].value),
//       count: Number(inputs[2].value),
//     };
//   });

//   const pricingplans = Array.from(document.querySelectorAll("#tdata3 tr")).map(
//     (tr) => {
//       const planStart = tr.querySelector("td:nth-child(1) input").value;
//       const planEnd = tr.querySelector("td:nth-child(2) input").value;

//       const shows = Array.from(
//         tr.querySelectorAll(".showtime-cell input[type='checkbox']")
//       ).map((cb) => ({
//         showname: cb.value,
//         shownamestatus: cb.checked,
//       }));

//       const tickets = Array.from(
//         tr.querySelectorAll(".ticket-cell .pricing-showtime")
//       ).map((div) => {
//         const checkEl = div.querySelector("input[type='checkbox']");
//         const price = div.querySelector(
//           ".pricing-showtime-in input:nth-child(1)"
//         ).value;
//         const count = div.querySelector(
//           ".pricing-showtime-in input:nth-child(2)"
//         ).value;

//         return {
//           ...(div.dataset.id ? { id: Number(div.dataset.id) } : {}),
//           category: checkEl.value,
//           price: Number(price),
//           count: Number(count),
//           catecheck: checkEl.checked,
//         };
//       });

//       return {
//         ...(tr.dataset.id ? { id: Number(tr.dataset.id) } : {}),
//         startdate: planStart,
//         enddate: planEnd,
//         shows,
//         tickets,
//       };
//     }
//   );

//   return {
//     theatername: {
//       name: document.getElementById("theaterSelect").selectedOptions[0].text,
//     },
//     eventdefaultstartandend: {
//       startdate: document.getElementById("startDate").value,
//       enddate: document.getElementById("endDate").value,
//       starttime: document.getElementById("startTime").value,
//       endtime: document.getElementById("endTime").value,
//     },
//     showtimes,
//     ticketcategories,
//     pricingplans,
//   };
// }

// loadAllEvents();
const clear = document.getElementById("Clear");
clear.addEventListener("click", () => {
  window.location.reload();
});

// function getAllShowtimes() {
//   return Array.from(document.querySelectorAll("#tdata tr")).map((row) => {
//     const [nameInput, startInput, endInput] = row.querySelectorAll("input");
//     return {
//       name: nameInput?.value || "",
//       starttime: startInput?.value || "",
//       endtime: endInput?.value || "",
//     };
//   });
// }

// function getAllTicketCategories() {
//   return Array.from(document.querySelectorAll("#tdata2 tr")).map((row) => {
//     const [catInput, priceInput, countInput] = row.querySelectorAll("input");
//     return {
//       category: catInput?.value || "",
//       price: priceInput?.value || 0,
//       count: countInput?.value || 0,
//     };
//   });
// }

// function getAllPricingPlans() {
//   return Array.from(document.querySelectorAll("#tdata3 tr")).map((row) => {
//     const startInput = row.querySelector("td:nth-child(1) input");
//     const endInput = row.querySelector("td:nth-child(2) input");

//     const showtimeCell = row.querySelector("td:nth-child(3)");
//     const shows = Array.from(showtimeCell.querySelectorAll("input[type='checkbox']")).map((cb) => ({
//       showname: cb.value,
//       shownamestatus: cb.checked,
//     }));

//     const ticketCell = row.querySelector("td:nth-child(4)");
//     const tickets = Array.from(ticketCell.querySelectorAll(".pricing-showtime")).map((div) => {
//       const checkbox = div.querySelector("input[type='checkbox']");
//       const inputs = div.querySelectorAll(".pricing-showtime-in input");
//       return {
//         category: checkbox?.value || "",
//         catecheck: checkbox?.checked || false,
//         price: inputs[0]?.value || 0,
//         count: inputs[1]?.value || 0,
//       };
//     });

//     return {
//       startdate: startInput?.value || "",
//       enddate: endInput?.value || "",
//       shows,
//       tickets,
//     };
//   });
// }

// function updateEvent(eventId) {
//   const theaterInput = document.querySelector("#thearter input[type='text']");
//   const name = theaterInput ? theaterInput.value.trim() : "";

//   const updatedEvent = {
//     theatername: { name: name },
//     eventdefaultstartandend: {
//       startdate: document.getElementById("startDate").value,
//       enddate: document.getElementById("endDate").value,
//       starttime: document.getElementById("startTime").value,
//       endtime: document.getElementById("endTime").value,
//     },
//     showtimes: getAllShowtimes(),
//     ticketcategories: getAllTicketCategories(),
//     pricingplans: getAllPricingPlans(),
//   };

//   console.log("Sending updated event:", updatedEvent); //  Debug

//   fetch(`http://localhost:3000/event/${eventId}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(updatedEvent),
//   })
//     .then((res) => {
//       if (!res.ok) {
//         return res.json().then((data) => {
//           throw new Error(data?.error || "Unknown error");
//         });
//       }
//       return res.json();
//     })
//     .then((res) => {
//       alert("Event updated successfully!");
//       loadAllEvents();
//     })
//     .catch((err) => {
//       console.error("Update failed:", err.message);
//       alert("Failed to update event.\n" + err.message); // Improved error alert
//     });
// }

// const ReUpdate = document.getElementById("ReUpdate");

// ReUpdate.addEventListener("click", () => {
//   const eventId = document.getElementById("theaterSelect").value;

//   if (!eventId) {
//     alert("Please select an event to update.");
//     return;
//   }

//   console.log("Updating event with ID:", eventId); // ✅ Debug
//   updateEvent(eventId);
// });

// function rebuildAllPricingRows() {
//   // Current show & category names from tables #tdata and #tdata2
//   const showNames = Array.from(document.querySelectorAll("#tdata tr input[type='text']"))
//     .map((i) => i.value.trim())
//     .filter(Boolean);
//   const catNames = Array.from(document.querySelectorAll("#tdata2 tr input[type='text']"))
//     .map((i) => i.value.trim())
//     .filter(Boolean);

//   document.querySelectorAll("#tdata3 tr").forEach((planRow) => {
//     // ---------------- Preserve existing state ----------------
//     const prevShow = {};
//     planRow.querySelectorAll(".show-ckeckbox input").forEach((cb) => {
//       prevShow[cb.value] = cb.checked;
//     });

//     const prevCat = {};
//     planRow.querySelectorAll(".pricing-showtime").forEach((block) => {
//       const cb = block.querySelector("input[type='checkbox']");
//       const price = block.querySelector(".pricing-showtime-in input:nth-child(1)")?.value || "";
//       const count = block.querySelector(".pricing-showtime-in input:nth-child(2)")?.value || "";
//       prevCat[cb.value] = { checked: cb.checked, price, count };
//     });

//     // ---------------- Defaults from initial load -------------
//     const defaultShows = JSON.parse(planRow.dataset.shows || "[]");
//     const defaultShowMap = Object.fromEntries(
//       defaultShows.map((s) => [s.showname, s.shownamestatus])
//     );

//     const defaultTickets = JSON.parse(planRow.dataset.tickets || "[]");
//     const defaultTicketMap = {};
//     defaultTickets.forEach((t) => {
//       defaultTicketMap[t.category] = {
//         checked: t.catecheck || t.categorystatus === 1 || false,
//         price: t.price || "",
//         count: t.count || "",
//       };
//     });

//     // -------------- Build show checkboxes --------------------
//     planRow.children[2].innerHTML = showNames
//       .map((sn) => {
//         const isChecked = prevShow[sn] ?? defaultShowMap[sn] ?? false;
//         return `<div class="show-ckeckbox"><input type="checkbox" value="${sn}" ${isChecked ? "checked" : ""} /><label>${sn}</label></div>`;
//       })
//       .join("");

//     // -------------- Build ticket blocks ----------------------
//     planRow.children[3].innerHTML = catNames
//       .map((cn) => {
//         const prev = prevCat[cn] || defaultTicketMap[cn] || {};
//         const ch = prev.checked ? "checked" : "";
//         const price = prev.price || "";
//         const count = prev.count || "";
//         return `<div class="pricing-showtime"><div><input type="checkbox" value="${cn}" ${ch} /><label>${cn}</label></div><div class="pricing-showtime-in"><input type="text" value="${price}" placeholder="Price"/><input type="text" value="${count}" placeholder="Count"/></div></div>`;
//       })
//       .join("");
//   });
// }

// /********************************************************************
//  *  fillEventForm(data)
//  *  Builds all tables from fetched event and wires Remove buttons.
//  *******************************************************************/
// function fillEventForm(data) {
//   const { event, showtimes, ticketcategories, pricingplans } = data;

//   // ---- Defaults ----
//   document.getElementById("startDate").value = event.startdate;
//   document.getElementById("endDate").value   = event.enddate;
//   document.getElementById("startTime").value = event.starttime;
//   document.getElementById("endTime").value   = event.endtime;

//   // ---- Showtimes ----
//   const tdata = document.getElementById("tdata");
//   tdata.innerHTML = "";
//   showtimes.forEach((s) => {
//     const tr = document.createElement("tr");
//     tr.innerHTML = `<td><input type="text" value="${s.name}" /></td><td><input type="time" value="${s.starttime}" /></td><td><input type="time" value="${s.endtime}" /></td><td><button class="btn">Remove</button></td>`;
//     tr.querySelector(".btn").onclick = () => { tr.remove(); rebuildAllPricingRows(); };
//     tdata.appendChild(tr);
//   });

//   // ---- Ticket categories ----
//   const tdata2 = document.getElementById("tdata2");
//   tdata2.innerHTML = "";
//   ticketcategories.forEach((c) => {
//     const tr = document.createElement("tr");
//     tr.innerHTML = `<td><input type="text" value="${c.category}" /></td><td><input type="number" value="${c.price}" /></td><td><input type="number" value="${c.count}" /></td><td><button class="btn">Remove</button></td>`;
//     tr.querySelector(".btn").onclick = () => { tr.remove(); rebuildAllPricingRows(); };
//     tdata2.appendChild(tr);
//   });

//   // ---- Pricing plans ----
//   const tdata3 = document.getElementById("tdata3");
//   tdata3.innerHTML = "";
//   pricingplans.forEach((p) => {
//     const tr = document.createElement("tr");
//     tr.dataset.shows   = JSON.stringify(p.shows || []);    // store defaults for rebuild
//     tr.dataset.tickets = JSON.stringify(p.tickets || []);

//     tr.innerHTML = `<td><div class="priceinput"><input type="date" class="startdate" value="${p.startdate}" /></div></td><td><div class="priceinput"><input type="date" class="enddate" value="${p.enddate}" /></div></td><td></td><td></td><td><button class="btn">Remove</button></td>`;

//     tr.querySelector(".btn").onclick = () => tr.remove();
//     tdata3.appendChild(tr);
//   });

//   // Initial sync so pricing rows contain correct check‑boxes and values
//   rebuildAllPricingRows();
// }

// // boot
// loadAllEvents();

// // let allEvents = [];

// async function loadAllEvents() {
//   try {
//     const res = await fetch("http://localhost:3000/events/all");
//     allEvents = await res.json();
//     populateTheaterDropdown(allEvents);
//   } catch (err) {
//     console.error("Error loading events:", err);
//   }
// }

// function populateTheaterDropdown(events) {
//   const select = document.getElementById("theaterSelect");
//   select.innerHTML = `<option value="">Select Theater</option>`; // Reset

//   const uniqueNames = [...new Set(events.map(e => e.event.thearter_name))];

//   uniqueNames.map(name => {
//     const opt = document.createElement("option");
//     opt.value = name;
//     opt.innerText = name;
//     select.appendChild(opt);
//   });
// }
// document.getElementById("theaterSelect").addEventListener("change", (e) => {
//   const selected = e.target.value;
//   const eventData = allEvents.find(e => e.event.thearter_name === selected);
//   if (eventData) {
//     fillEventForm(eventData);
//   }
// });
// function fillEventForm(data) {
//   const { event, showtimes, ticketcategories, pricingplans } = data;

//   // Fill Date & Time
//   document.getElementById("startDate").value = new Date(event.startdate).toISOString().split("T")[0];
//   document.getElementById("endDate").value = new Date(event.enddate).toISOString().split("T")[0];
//   document.getElementById("startTime").value = event.starttime.slice(0, 5);
//   document.getElementById("endTime").value = event.endtime.slice(0, 5);

//   // Fill Showtimes
//   const tdata = document.getElementById("tdata");
//   tdata.innerHTML = "";
//   showtimes.map(show => {
//     const tr = document.createElement("tr");
//     tr.innerHTML = `
//       <td><input type="text" value="${show.name}" /></td>
//       <td><input type="time" value="${show.starttime.slice(0,5)}" /></td>
//       <td><input type="time" value="${show.endtime.slice(0,5)}" /></td>
//       <td><button onclick="this.closest('tr').remove()">Remove</button></td>
//     `;
//     tdata.appendChild(tr);
//   });

//   // Fill Ticket Categories
//   const tdata2 = document.getElementById("tdata2");
//   tdata2.innerHTML = "";
//   ticketcategories.map(cat => {
//     const tr = document.createElement("tr");
//     tr.innerHTML = `
//       <td><input type="text" value="${cat.category}" /></td>
//       <td><input type="number" value="${cat.price}" /></td>
//       <td><input type="number" value="${cat.count}" /></td>
//       <td><button onclick="this.closest('tr').remove()">Remove</button></td>
//     `;
//     tdata2.appendChild(tr);
//   });

//   // Fill Pricing Plans
//   const tdata3 = document.getElementById("tdata3");
//   tdata3.innerHTML = "";
//   pricingplans.map(plan => {
//     const tr = document.createElement("tr");

//     const showCheckboxes = plan.shows.map(s => `
//       <div class="show-ckeckbox">
//         <input type="checkbox" ${s.shownamestatus ? "checked" : ""} />
//         <label>${s.showname}</label>
//       </div>
//     `).join("");

//     const ticketInputs = plan.tickets.map(t => `
//       <div class="pricing-showtime">
//         <div>
//           <input type="checkbox" ${t.categorystatus === 1 ? "checked" : ""} />
//           <label>${t.category}</label>
//         </div>
//         <div class="pricing-showtime-in">
//           <input type="text" value="${t.price}" />
//           <input type="text" value="${t.count}" />
//         </div>
//       </div>
//     `).join("");

//     tr.innerHTML = `
//       <td><input type="date" value="${new Date(plan.startdate).toISOString().split("T")[0]}" /></td>
//       <td><input type="date" value="${new Date(plan.enddate).toISOString().split("T")[0]}" /></td>
//       <td>${showCheckboxes}</td>
//       <td>${ticketInputs}</td>
//       <td><button onclick="this.closest('tr').remove()">Remove</button></td>
//     `;
//     tdata3.appendChild(tr);
//   });
// }
// loadAllEvents();
