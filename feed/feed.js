let allArticles = []; 
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || []; 
let votes = JSON.parse(localStorage.getItem('votes')) || {}; 
 
// Load feed on page load 
document.addEventListener('DOMContentLoaded', () => { 
 loadFeed(); 
 loadStats(); 
 // Allow search on Enter key
 document.getElementById('searchInput').addEventListener('keypress', (e) => {
 if (e.key === 'Enter') searchNews();
 });
}); 
 
// Load all articles 
async function loadFeed() { 
 try { 
 const response = await fetch('/api/feed'); 
 allArticles = await response.json(); 
 renderFeed(allArticles); 
 } catch (error) { 
 console.error('Error loading feed:', error); 
 } 
} 
 
// Load stats 
async function loadStats() { 
 try { 
 const response = await fetch('/api/stats'); 
 const stats = await response.json(); 
 document.getElementById('totalPosts').textContent = stats.total_posts; 
 document.getElementById('totalUpvotes').textContent = stats.total_upvotes.toLocaleString(); 
 document.getElementById('totalViews').textContent = stats.total_views.toLocaleString(); 
 } catch (error) { 
 console.error('Error loading stats:', error); 
 } 
} 
 
// Render articles 
function renderFeed(articles) { 
 const feedContainer = document.getElementById('feedContainer'); 
 feedContainer.innerHTML = ''; 
 
 if (articles.length === 0) { 
 feedContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">No articles found</div>'; 
 return; 
 } 
 
 articles.forEach(article => { 
 const card = createArticleCard(article); 
 feedContainer.appendChild(card); 
 }); 
} 
 
// Create article card 
function createArticleCard(article) { 
 const card = document.createElement('div'); 
 card.className = 'article-card'; 
 
 const tagsHTML = article.tags.map(tag => 
 `<span class="tag" onclick="filterByTag('${tag}')">${tag}</span>` 
 ).join(''); 
 
 const isBookmarked = bookmarks.includes(article.id); 
 const bookmarkBtnClass = isBookmarked ? 'active' : ''; 
 
 // Truncate description for initial display
 const truncatedDesc = article.description.substring(0, 300) + '...';
 const fullDesc = article.description;
 const isLong = article.description.length > 300;

 card.innerHTML = ` 
 <div class="article-title">${article.title}</div>
 <div class="article-description-container">
  <div class="article-description" id="desc-${article.id}">${truncatedDesc}</div>
  ${isLong ? `<button class="read-more-btn" onclick="toggleDescription(${article.id})">Read More</button>` : ''}
 </div>
 <div class="article-tags">${tagsHTML}</div>
 
 <div class="article-footer">
  <div class="article-stats">
   <div class="stat-item">👍 <span>${article.upvotes}</span></div>
   <div class="stat-item">👎 <span>${article.downvotes}</span></div>
   <div class="stat-item">👁️ <span>${article.views}</span></div>
  </div>
  
  <div class="article-actions">
   <button class="action-btn" onclick="upvote(${article.id})">👍 Upvote</button>
   <button class="action-btn" onclick="downvote(${article.id})">👎 Downvote</button>
   <button class="action-btn ${bookmarkBtnClass}" onclick="toggleBookmark(${article.id})">🔖 Save</button>
  </div>
 </div>
 `; 
 
 return card; 
}

// Toggle Read More/Read Less
function toggleDescription(id) {
 const descElement = document.getElementById(`desc-${id}`);
 const article = allArticles.find(a => a.id === id);
 
 if (descElement.classList.contains('expanded')) {
  descElement.classList.remove('expanded');
  descElement.textContent = article.description.substring(0, 300) + '...';
 } else {
  descElement.classList.add('expanded');
  descElement.textContent = article.description;
 }
}
 
// Upvote 
async function upvote(id) { 
 try { 
 await fetch('/api/vote', { 
 method: 'POST', 
 headers: { 'Content-Type': 'application/json' }, 
 body: JSON.stringify({ id, type: 'upvote' }) 
 }); 
 votes[id] = 'upvote'; 
 localStorage.setItem('votes', JSON.stringify(votes)); 
 loadFeed(); 
 loadStats(); 
 } catch (error) { 
 console.error('Error upvoting:', error); 
 } 
} 
 
// Downvote 
async function downvote(id) { 
 try { 
 await fetch('/api/vote', { 
 method: 'POST', 
 headers: { 'Content-Type': 'application/json' }, 
 body: JSON.stringify({ id, type: 'downvote' }) 
 }); 
 votes[id] = 'downvote'; 
 localStorage.setItem('votes', JSON.stringify(votes)); 
 loadFeed(); 
 loadStats(); 
 } catch (error) { 
 console.error('Error downvoting:', error); 
 } 
} 
 
// Toggle bookmark 
function toggleBookmark(id) { 
 if (bookmarks.includes(id)) { 
 bookmarks = bookmarks.filter(bid => bid !== id); 
 } else { 
 bookmarks.push(id); 
 } 
 localStorage.setItem('bookmarks', JSON.stringify(bookmarks)); 
 loadFeed(); 
} 
 
// Search news 
function searchNews() { 
 const query = document.getElementById('searchInput').value; 
 if (query.trim()) { 
 fetch(`/api/feed?search=${encodeURIComponent(query)}`) 
 .then(r => r.json()) 
 .then(articles => renderFeed(articles)) 
 .catch(err => console.error('Error searching:', err)); 
 } else { 
 loadFeed(); 
 } 
} 
 
// Filter by tag 
function filterByTag(tag) { 
 fetch(`/api/feed?tag=${encodeURIComponent(tag)}`) 
 .then(r => r.json()) 
 .then(articles => renderFeed(articles)) 
 .catch(err => console.error('Error filtering:', err)); 
} 
 
// Load trending 
function loadTrending() { 
 fetch('/api/feed?trending=true') 
 .then(r => r.json()) 
 .then(articles => renderFeed(articles)) 
 .catch(err => console.error('Error loading trending:', err)); 
} 
 
// Load bookmarks 
function loadBookmarks() { 
 const bookmarkedArticles = allArticles.filter(a => bookmarks.includes(a.id)); 
 renderFeed(bookmarkedArticles); 
} 
 
// Load home (all articles) 
function loadHome() { 
 loadFeed(); 
}

// Profile Modal
function openProfile() {
 const modal = document.getElementById('profileModal');
 document.getElementById('profileBookmarks').textContent = bookmarks.length;
 document.getElementById('profileVotes').textContent = Object.keys(votes).length;
 modal.style.display = 'block';
}

function closeProfile() {
 document.getElementById('profileModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
 const modal = document.getElementById('profileModal');
 if (event.target === modal) {
  modal.style.display = 'none';
 }
}
