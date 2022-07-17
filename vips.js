const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const dataPanel = document.querySelector('#data-panel')

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const users = JSON.parse(localStorage.getItem('vipGuests')) || []
let filteredUsers = []

const GUESTS_PER_PAGE = 18


function renderUserList(user) {
  let rawHtml = ''
  user.forEach((item) => {
    rawHtml += ` 
      <div class="col-sm-2 mb-4 card border border-white">
        <div class="card-body show-user-modal mb-0" data-bs-toggle="modal" data-bs-target="#user-modal" data-id ="${item.id}">
          <img src="${item.avatar}" class="card-img-top show-user-modal rounded-3" data-id="${item.id}" alt="User Avatar" />
          <h5 class ="card-title show-user-modal fs-6 d-flex align-items-end justify-content-center" data-id="${item.id}">${item.surname} ${item.name}</h5> 
        </div> 
        <div class="card-footer border-white mt-0 d-flex align-items-center justify-content-between">
          <button class="btn"><i class="fa-solid fa-rectangle-xmark fa-xl" data-bs-toggle="tooltip" data-bs-placement="top" title="Kick out of VIPs" data-id ="${item.id}"></i></button>

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

  axios.get(INDEX_URL + id).then((response) => {
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
  })
}

function removeFromVips(id) {
  const vipIndex = users.findIndex((vip) => vip.id === id)
  // console.log(vipIndex)
  users.splice(vipIndex, 1)
  localStorage.setItem('vipGuests', JSON.stringify(users))
  renderUserList(users)
}

function addToBlockList(id) {
  console.log(id)
  const list = JSON.parse(localStorage.getItem('blockedGuests')) || []
  const blocked = users.find((blocked) => blocked.id === id)
  if (list.some(blocked => blocked.id === id)) {
    return alert('此客人已是黑名單')
  }
  list.push(blocked)
  localStorage.setItem('blockedGuests', JSON.stringify(list))
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".show-user-modal")) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".fa-rectangle-xmark")) {
    removeFromVips(Number(event.target.dataset.id))
  } else if (event.target.matches(".fa-book-skull")) {
    addToBlockList(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  // if (!keyword.length) {
  //   return alert('Please input valid keyword')
  // }

  filteredUsers = users.filter((user) =>
    (user.name.toLowerCase().includes(keyword)) || (user.surname.toLowerCase().includes(keyword)))
  if (filteredUsers.length === 0) {
    return alert('Can not find Guests with keyword: ' + keyword)
  }
  renderPaginator(filteredUsers.length)
  renderUserList(getUsersByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 若點擊的target元素 其標籤不是 <a></a>，則結束函式
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  // console.log (page)
  renderUserList(getUsersByPage(page))
})


renderPaginator(users.length)
renderUserList(getUsersByPage(1))

