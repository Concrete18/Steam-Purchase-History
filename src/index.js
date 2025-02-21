// ==UserScript==
// @name        Steam Purchase History Checker
// @namespace   https://michaele.us
// @match       https://store.steampowered.com/account/history/
// @icon        https://www.google.com/s2/favicons?sz=64&domain=store.steampowered.com
// @grant       none
// @version     1.0
// @author      Concrete18
// @description This allows the creation of a table showing purchases, refund and net market value over the current month, year and overall time of the account. Refunding one game from a custom bundle will skew calculations.
// ==/UserScript==

// Expands view of purchase history by pressing the show more button
function expandHistory() {
  const loadMoreButton = document.getElementById("load_more_button");
  if (loadMoreButton) {
    if (loadMoreButton.style.display != "none") {
      loadMoreButton.click();
    }
  }
}

// Checks if given date is from this month and year
function isDateWithinThisMonthAndYear(date) {
  const givenDate = new Date(date);
  const currentDate = new Date();
  return [
    givenDate.getMonth() === currentDate.getMonth(),
    givenDate.getFullYear() === currentDate.getFullYear(),
  ];
}

function allowEntry(name, type) {
  if (!type || !name) return false;
  // Check if the type includes any of the allowed types
  const allowedTypes = [
    "Purchase",
    "Refund",
    "Gift Purchase",
    "Market Transaction",
  ];
  const isAllowedType = allowedTypes.some((allowedType) =>
    type.includes(allowedType)
  );
  if (!isAllowedType) return false;
  // ignored since it adds to wallet credit
  if (name.includes("Digital Gift Card")) return false;
  if (name.includes("Wallet Credit")) return false;
  return true;
}

// Gets purchase history table from page
function getHistoryTable(allDataShown) {
  const table = document.querySelector("table");
  if (table) {
    let purchaseData = {
      month: {
        purchases: 0,
        refunds: 0,
        market: 0,
      },
      year: {
        purchases: 0,
        refunds: 0,
        market: 0,
      },
    };
    // adds overall data if show more button is not shown
    if (allDataShown) {
      purchaseData["overall"] = {
        purchases: 0,
        refunds: 0,
        market: 0,
      };
    }
    const rows = table.rows;
    for (let i = 2; i < rows.length; i++) {
      const cells = rows[i].cells;
      let date = cells[0]?.innerText;
      let name = cells[1]?.innerText;
      let type = cells[2]?.innerText.split("\n")[0];
      // sets total
      let total = cells[3]?.innerText.replace("$", "");
      let totalDivs = cells[3]?.querySelectorAll("div");

      let credit =
        totalDivs?.length >= 2 ? totalDivs[1].innerText.replace("$", "") : null;

      if (total) {
        total = parseFloat(total);
      } else {
        continue;
      }
      let [thisMonth, thisYear] = isDateWithinThisMonthAndYear(date);
      if (allowEntry(name, type)) {
        if (type.includes("Purchase")) {
          if (allDataShown) {
            purchaseData.overall.purchases += total;
          }
          if (thisMonth && thisYear) {
            purchaseData.month.purchases += total;
          }
          if (thisYear) {
            purchaseData.year.purchases += total;
          }
        } else if (type.includes("Market")) {
          if (allDataShown) {
            if (credit) {
              purchaseData.overall.market -= total;
            } else {
              purchaseData.overall.market += total;
            }
          }
          if (thisMonth && thisYear) {
            if (credit) {
              purchaseData.month.market -= total;
            } else {
              purchaseData.month.market += total;
            }
          }
          if (thisYear) {
            if (credit) {
              purchaseData.year.market -= total;
            } else {
              purchaseData.year.market += total;
            }
          }
        } else {
          // single game refunds from a group purchase can have missing refund data due to lack of data in table
          if (allDataShown) {
            purchaseData.overall.refunds += total;
          }
          if (thisMonth && thisYear) {
            purchaseData.month.refunds += total;
          }
          if (thisYear) {
            purchaseData.year.refunds += total;
          }
        }
      }
    }

    return purchaseData;
  } else {
    console.log("Table not found");
  }
}

// Function to get elements with a specific class but no other classes
function getElementsWithSingleClass(className) {
  const allElements = document.getElementsByClassName(className);
  if (allElements) {
    const filteredElements = Array.from(allElements).filter(
      (element) => element.classList.length === 1
    );
    return filteredElements[0];
  }
  return null;
}

function removeNonGames(games) {
  const removeIfPresent = ["View Shipment Details", "Gift sent to"];
  return games.filter(
    (item) => !removeIfPresent.some((substring) => item.includes(substring))
  );
}

// gets steam purchase history as an array of objects
function getPurchaseHistory() {
  const table = getElementsWithSingleClass("wallet_history_table");
  if (table) {
    purchaseHistory = [];
    const rows = table.rows;
    for (let i = 2; i < rows.length; i++) {
      const cells = rows[i].cells;
      let date = cells[0]?.innerText;
      let name = cells[1]?.innerText;
      let type = cells[2]?.innerText.split("\n")[0];
      let total = cells[3]?.innerText.replace("$", "");
      if (total) total = parseFloat(total);
      if (allowEntry(name, type)) {
        let games = name.replace("\nRefund", "").split("\n");
        games = removeNonGames(games);
        purchaseHistory.push({
          date,
          games,
          type,
          total,
        });
      }
    }
    return purchaseHistory;
  } else {
    console.log("Table not found");
  }
}

function formatNum(num) {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Function to create and return an HTML table element from the counts data
function createNewTable(data) {
  const table = document.createElement("table");
  table.className = "wallet_history_table purchase_count_table";

  const padding = "8px";
  const datFontSize = "12px";

  // Create the header row
  const headerRow = document.createElement("tr");
  const headers = ["Period", "Purchases", "Refunds", "Market", "Total"];
  headers.forEach((headerText) => {
    const header = document.createElement("th");
    header.style.padding = padding;
    header.style.marginTop = "10px";
    table.style.marginBottom = "20px"; // Add bottom margin for spacing
    header.style.fontSize = "13px";
    header.textContent = headerText;
    headerRow.appendChild(header);
  });
  table.appendChild(headerRow);

  // Create data rows
  for (const period in data) {
    const row = document.createElement("tr");

    const periodCell = document.createElement("td");
    periodCell.style.padding = padding;
    periodCell.style.fontSize = datFontSize;
    periodCell.textContent = period.charAt(0).toUpperCase() + period.slice(1);
    row.appendChild(periodCell);

    const purchasesCell = document.createElement("td");
    purchasesCell.style.padding = padding;
    purchasesCell.style.fontSize = datFontSize;
    let purchasesNum = formatNum(data[period].purchases);
    purchasesCell.textContent = `-$${purchasesNum}`;
    row.appendChild(purchasesCell);

    const refundsCell = document.createElement("td");
    refundsCell.style.padding = padding;
    refundsCell.style.fontSize = datFontSize;
    let refundNum = formatNum(data[period].refunds);
    refundsCell.textContent = `+$${refundNum}`;
    row.appendChild(refundsCell);

    const marketCell = document.createElement("td");
    marketCell.style.padding = padding;
    marketCell.style.fontSize = datFontSize;
    let marketPolarity = data[period].market < 0 ? "+" : "-";
    let marketNum = formatNum(Math.abs(data[period].market));
    marketCell.textContent = `${marketPolarity}$${marketNum}`;
    row.appendChild(marketCell);

    const totalCell = document.createElement("td");
    totalCell.style.padding = padding;
    totalCell.style.fontSize = datFontSize;
    let totalNum =
      data[period].purchases - data[period].refunds + data[period].market;
    let totalPolarity = totalNum < 0 ? "+" : "-";
    let formattedTotal = formatNum(Math.abs(totalNum));
    totalCell.textContent = `${totalPolarity}$${formattedTotal}`;
    row.appendChild(totalCell);

    table.appendChild(row);
  }

  return table;
}

// Function to insert the table into the page
function insertTableIntoPage(table) {
  const targetElement = document.querySelector(".wallet_history_click_hint");
  if (targetElement) {
    targetElement.parentNode.insertBefore(table, targetElement);
  } else {
    console.log("Target element not found");
  }
}

// Displays Purchase data based on month, year and entire history if it is all visible
function displayData(showOverall) {
  const historyTable = getHistoryTable(showOverall);
  console.log("retrieved purchase history");
  const newTable = createNewTable(historyTable);
  console.log("created table");
  insertTableIntoPage(newTable);
  console.log("inserted table");
}

function addBeforeElement(targetSelector, newElement) {
  const targetElement = document.querySelector(targetSelector);
  if (targetElement) {
    targetElement.parentNode.insertBefore(newElement, targetElement);
  } else {
    console.log("Target element not found");
  }
}

function addCreateTableButton() {
  const newButton = document.createElement("button");

  newButton.addEventListener("click", () => {
    const targetElement = document.querySelector(".purchase_count_table");
    if (targetElement) targetElement.remove();

    // determines if all data is currently in the table
    const loadMoreButton = document.getElementById("load_more_button");
    const historyLoading = document.getElementById("wallet_history_loading");
    let showOverall = false;
    if (loadMoreButton && historyLoading) {
      if (
        loadMoreButton.style.display == "none" &&
        historyLoading.style.display == "none"
      )
        showOverall = true;
    }

    displayData(showOverall);
  });

  newButton.textContent = "Create Table";
  newButton.className = "btnv6_blue_hoverfade btn_medium";
  newButton.style.padding = "7px 12px";
  newButton.style.marginBottom = "10px";
  newButton.style.marginRight = "10px";

  const targetSelector = ".wallet_history_click_hint";
  addBeforeElement(targetSelector, newButton);
}

function downloadAsJSON(purchaseData) {
  if (!purchaseData.length) {
    alert("No data to download.");
    return;
  }
  const jsonString = JSON.stringify(purchaseData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "steam_purchase_history.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function addDownloadPurchaseHistoryButton() {
  const newButton = document.createElement("button");
  newButton.addEventListener("click", () => {
    let purchaseHistory = getPurchaseHistory();
    downloadAsJSON(purchaseHistory);
  });
  newButton.textContent = "Download Purchase History";
  newButton.className = "btnv6_blue_hoverfade btn_medium";
  newButton.style.padding = "7px 12px";
  newButton.style.marginBottom = "10px";
  newButton.style.marginRight = "10px";

  const targetSelector = ".wallet_history_click_hint";
  addBeforeElement(targetSelector, newButton);
}

(function () {
  "use strict";

  // exports for tests only when it can be
  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = {
      allowEntry,
      removeNonGames,
    };
  }

  // expands history every time the table finishes updates
  const observer = new MutationObserver(() => {
    expandHistory();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  addCreateTableButton();
  addDownloadPurchaseHistoryButton();
})();
