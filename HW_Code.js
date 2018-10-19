var $table = document.querySelector("#ufo-table");
var $loader = document.querySelector(".loader");
var $pagination = document.querySelector(".pagination");
var $tbody = document.getElementsByTagName("tbody")[0];
var $countrySearch = document.querySelector("#country-search");
var $shapeSearch = document.querySelector("#shape-search");
var $dateSearch = document.querySelector("#date-search");
var $citySearch = document.querySelector("#city-search");
var $stateSearch = document.querySelector("#state-search");
var $numResults = document.querySelector("#num-results");
var $updateFilterBtn = document.querySelector("#filter-submit");

$pagination.addEventListener("click", changePage);
$updateFilterBtn.addEventListener("click", filterData);

var filterOptions = {
  datetime: function() {
    return $dateSearch.value.trim();
  },
  city: function() {
    return $citySearch.value.trim();
  },
  state: function() {
    return $stateSearch.value.trim();
  },
  country: function() {
    return $countrySearch.value.trim();
  },
  shape: function() {
    return $shapeSearch.value.trim();
  }
};

var data = {
  dataSet: dataSet,
  filtered: dataSet,
    updateFilter: function() {
    var filterKeys = Object.keys(filterOptions);
    this.filtered = this.dataSet.filter(function(ufoRecord) {
      for (var i = 0; i < filterKeys.length; i++) {
        if (!fuzzySearch(filterOptions[filterKeys[i]](), ufoRecord[filterKeys[i]])) {
          return false;
        }
      }
      return true;
    });
  }
};

function fuzzySearch(search, result) {
  var slicedResult = result.slice(0, search.length);
  if (search === slicedResult) {
    return true;
  }
  return false;
}

var page = {
  currentPage: 1,
  numPages: function() {
    return Math.ceil(data.filtered.length / this.resultsPerPage());
  },
  resultsPerPage: function() {
    return $numResults.value.trim();
  },
  getPageSubset: function() {
    var counter;
    if (this.currentPage < 11) {
      counter = 1;
    }
    else if (this.currentPage % 10 === 0) {
      counter = this.currentPage - 9;
    }
    else {
      counter = Math.floor(this.currentPage / 10) * 10 + 1;
    }
    var pageNumbers = [counter];
    counter++;
    while (pageNumbers[pageNumbers.length - 1] < this.numPages() && pageNumbers.length < 10) {
      pageNumbers.push(counter);
      counter++;
    }
    return pageNumbers;
  },
  paginate: function(array, pageSize, pageNumber) {
    pageNumber--;
    return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
  }
};

init();

function init() {
  loadDropdown();
  loadTable();
  appendPagination();
}

function filterData() {
  data.updateFilter();

  loadTable();

  appendPagination();
}

function loadDropdown() {
  var dropdownOptions = {
    country: ["<option default value=''>all</option>"],
    shape: ["<option default value=''>all</option>"]
  };

  var optionKeys = Object.keys(dropdownOptions);

  for (var i = 0; i < data.dataSet.length; i++) {
    var ufoData = data.dataSet[i];
    for (var j = 0; j < optionKeys.length; j++) {
      var dropdownOption = optionKeys[j];
      var optionHTML = "<option value='" + ufoData[dropdownOption] + "'>" + ufoData[dropdownOption] + "</option>";
      if (dropdownOptions[dropdownOption].indexOf(optionHTML) < 0) {
        dropdownOptions[dropdownOption].push(optionHTML);
      }
    }
  }
  $countrySearch.innerHTML = dropdownOptions.country.join("");
  $shapeSearch.innerHTML = dropdownOptions.shape.join("");
}

function changePage(event) {
  event.preventDefault();
  var paginationBtn = event.target;
  var newPageNumber = parseInt(paginationBtn.getAttribute("href"));
  if (newPageNumber < 1 || newPageNumber > page.numPages()) {
    return false;
  }
  page.currentPage = newPageNumber;
  if (paginationBtn.getAttribute("class") === "page-direction") {
    appendPagination();
  }
  else {
    setActivePage();
  }
  return loadTable();
}

function setActivePage() {
  for (var i = 0; i < $pagination.children.length; i++) {
    var li = $pagination.children[i];
    if (parseInt(li.children[0].getAttribute("href")) === page.currentPage) {
      li.classList = "active";
    }
    else {
      li.classList = "";
    }
  }
}

function appendPagination() {
  $pagination.innerHTML = "";
  var fragment = document.createDocumentFragment();
  var pageSubset = page.getPageSubset();
  var backButton = document.createElement("li");
  backButton.innerHTML = "<a class='page-direction' href='" + (pageSubset[0] - 1) + "'><</a>";
  fragment.appendChild(backButton);

  var listItem;
  for (var i = 0; i < pageSubset.length; i++) {
    listItem = document.createElement("li");
    listItem.innerHTML = "<a href='" + pageSubset[i] + "'>" + pageSubset[i] + "</a>";
    if (pageSubset[i] === page.currentPage) {
      listItem.classList = "active";
    }
    fragment.appendChild(listItem);
  }

  var forwardButton = document.createElement("li");
  forwardButton.classList = "page-direction";
  forwardButton.innerHTML = "<a class='page-direction' href='" + (pageSubset[0] + pageSubset.length) + "'>></a>";
  fragment.appendChild(forwardButton);
  $pagination.appendChild(fragment);
}

function loadTable() {
  $tbody.innerHTML = "";
  showLoader(true);
  var fragment = document.createDocumentFragment();
  var resultsThisPage = page.paginate(
    data.filtered,
    page.resultsPerPage(),
    page.currentPage
  );

  for (var i = 0; i < resultsThisPage.length; i++) {
    var ufoObject = resultsThisPage[i];
    var ufoKeys = Object.keys(ufoObject);
    var $row = document.createElement("tr");
    $row.className = "table-row";

    for (var j = 0; j < ufoKeys.length; j++) {
      var currentKey = ufoKeys[j];
      var $cell = $row.insertCell(j);
      $cell.innerHTML = ufoObject[currentKey];
      $cell.className = "text-center";
      $cell.setAttribute("data-th", currentKey);
    }
    fragment.appendChild($row);
  }

  showLoader(false);
  $tbody.appendChild(fragment);
}

function showLoader(shouldLoad) {
  if (!shouldLoad) {
    $table.style.visibility = "visible";
    $loader.style.display = "none";
  }
  else {
    $table.style.visibility = "hidden";
    $loader.style.display = "block";
  }
}
