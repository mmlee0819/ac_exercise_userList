const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const users = []
let filteredUsers = []


const GUESTS_PER_PAGE = 18


function renderUsersList(users) {
  let rawHtml = ''
  users.forEach((item) => {
    rawHtml += ` 
      <div class="col-6 col-sm-2 mb-4 card border border-white">
        <div class="card-body show-user-modal mb-0" data-bs-toggle="modal" data-bs-target="#user-modal" data-id ="${item.id}">
          <img src="${item.avatar}" class="img-fluid card-img-top show-user-modal rounded-3" data-id="${item.id}" alt="User Avatar" />
          <h5 class ="card-title show-user-modal fs-6 d-flex align-items-end justify-content-center" data-id="${item.id}">${item.surname} ${item.name}</h5> 
        </div> 
        <div class="card-footer border-white mt-0 d-flex align-items-center justify-content-between">
          <button class="btn btn-vip-or-not btn-is-vip"><i class="fa-solid fa-crown fa-xl" data-bs-toggle="tooltip" data-bs-placement="top" title="Add to VIPs" data-id ="${item.id}"></i></button>
          <button class="btn"><i class="fa-solid fa-book-skull fa-xl" data-bs-toggle="tooltip" data-bs-placement="top" title="Add to Block List" data-id ="${item.id}"></i></button>
        </div>         
      </div>
    `
  })
  dataPanel.innerHTML = rawHtml
}


// 傳入的參數為users的總數量
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / GUESTS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item">
        <a class="page-link href="#" data-page="${page}">${page}</a>
      </li>
    `
  }
  paginator.innerHTML = rawHTML
  // console.log(paginator.innerHTML)
}

function getUsersByPage(page) {
  const startIndex = (page - 1) * GUESTS_PER_PAGE
  const data = filteredUsers.length ? filteredUsers : users
  return data.slice(startIndex, startIndex + GUESTS_PER_PAGE)
}


function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-name')
  const modalAvatar = document.querySelector('.user-modal-avatar')
  const modalInfo = document.querySelector('#user-modal-info')

  // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
  modalTitle.innerText = ''
  modalAvatar.src = ''
  modalInfo.innerHTML = ''

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data
      modalTitle.innerText = data.surname + ' ' + data.name
      modalAvatar.src = data.avatar
      // console.log(modalAvatar)
      modalInfo.innerHTML = ` 
        <p id="user-modal-gender">Gender: ${data.gender}</p>
        <p id="user-modal-birthday">Birthday: ${data.birthday}</p>
        <p id="user-modal-age">Age: ${data.age}</p>
        <p id="user-modal-email">Email: ${data.email}</p>
        `
      // console.log(modalInfo)
    })
}

const viplist = JSON.parse(localStorage.getItem('vipGuests')) || []
const blockList = JSON.parse(localStorage.getItem('blockedGuests')) || []

function addToVips(id) {
  // console.log(id)
  const vip = users.find((vip) => vip.id === id)
  // console.log(vip)
  if (viplist.some(vip => vip.id === id)) {
    return alert('此客人已是VIP')
  }
  viplist.push(vip)
  localStorage.setItem('vipGuests', JSON.stringify(viplist))
}

function toBeVip(id) {
  const vipOrNot = document.querySelector('.btn-vip-or-not')
  vipOrNot.forEach(btn => {
    if (viplist.some(vip => vip.id === Number(btn.dataset.id))) {
      btn.classList = 'btn btn-light rounded-pill btn-vip-or-not btn-is-vip'
      btn.innerHTML = 'VIP <i class="fa-solid fa-check fa-xl" data-bs-toggle="tooltip" data-bs-placement="top" title="is VIP" data-id ="${item.id}"></i>'
    }
  })
}

  function addToBlockList(id) {
    const blockList = JSON.parse(localStorage.getItem('blockedGuests')) || []
    const blocked = users.find((blocked) => blocked.id === id)
    if (blockList.some(blocked => blocked.id === id)) {
      return alert('此客人已是黑名單')
    }
    blockList.push(blocked)
    localStorage.setItem('blockedGuests', JSON.stringify(blockList))
  }

  dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.show-user-modal')) {
      showUserModal(Number(event.target.dataset.id))
    } else if (event.target.matches('.fa-crown')) {
      addToVips(Number(event.target.dataset.id))
      toBeVip()
    } else if (event.target.matches('.fa-book-skull')) {
      addToBlockList(Number(event.target.dataset.id))
    }
  })

  searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    event.preventDefault()
    const keyword = searchInput.value.trim().toLowerCase()
    // 輸入框設定條件: 若關鍵字長度=0, 跳出提示框 >> 若省略此條件，則關鍵字為" "時，可讓所有名單又出現，不用重整頁面
    // if (!keyword.length) {
    //   return alert('Please input valid keyword')
    // }
    filteredUsers = users.filter((user) =>
      (user.name.toLowerCase().includes(keyword)) || (user.surname.toLowerCase().includes(keyword)))
    if (filteredUsers.length === 0) {
      return alert('Can not find Guests with keyword: ' + keyword)
    }
    // 搜尋時也要重新渲染分頁器
    renderPaginator(filteredUsers.length)
    renderUsersList(getUsersByPage(1))
  })

  paginator.addEventListener('click', function onPaginatorClicked(event) {
    // 若點擊的target元素 其標籤不是 <a></a>，則結束函式
    if (event.target.tagName !== 'A') return

    const page = Number(event.target.dataset.page)
    // console.log (page)
    renderUsersList(getUsersByPage(page))
  })


  axios
    .get(INDEX_URL)
    .then((response) => {
      users.push(...response.data.results)
      renderPaginator(users.length)
      renderUsersList(getUsersbyPage(1))
    })
    .catch((err) => console.log(err))