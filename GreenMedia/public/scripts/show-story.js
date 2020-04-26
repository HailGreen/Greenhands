function addComment(story_id) {
    // initStories()
    $(`.list-group[story-id=${story_id}]`).append('     <form id="uploadComment" onsubmit="return false;" enctype="multipart/form-data">' +
        '                            <li class="list-group-item" id="comment-li">\n' +
        '                                <textarea class="comment-textarea" name="text1" id="text1"></textarea>\n' +
        '                                <div class="float-right" onclick="removeComment()"><span class="glyphicon glyphicon-remove no-icon-word-button" aria-hidden="true"  ></span></div>\n' +
        `                                <button class="btn btn-primary btn-sm float-right"  id="submit-button" onclick="insertComment('${story_id}')">submit</button>\n` +
        '                            </li>' +
        '                          </form>');
}

function removeComment() {
    $("#comment-li").remove();
}

function insertComment(story_id) {
    var comment = {};
    comment["user_id"] = localStorage.getItem("user_id");
    comment["story_id"] = story_id;
    comment["user_name"] = localStorage.getItem("user_name");
    comment["text"] = $("#text1").val();
    sendAjaxInsertComment('/add-comment', comment);
}

function sendAjaxInsertComment(url, comment) {
    $.ajax({
        url: url,
        data: comment,
        dataType: 'json',
        type: 'POST',
        success: function () {
            console.log("insert successfully");
            removeComment()
            getComments(comment.story_id)
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}

function initStories() {
    console.log("initStories")
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register("/scripts/service-worker.js")
            .then(function () {
                console.log('Service Worker Registered')
            })
    }
}

function getStories() {
    var url = '/show-story';
    var user = {};
    user['user_id'] = '1';
    sendAjaxQuery(url, user);
}

function getStar(story_id) {
    var star = {};
    star['story_id'] = story_id;
    star["user_id"] = localStorage.getItem("user_id");
    $.ajax({
        url: '/get-star',
        data: star,
        dataType: 'JSON',
        type: 'POST',
        success: function (dataR) {
            dataR.forEach((item)=>{
                changeStarShow(item.rate, item.story_id)
            })
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}

function getStars() {
    $.ajax({
        url: '/get-stars',
        dataType: 'JSON',
        type: 'POST',
        success: function (dataR) {
            console.log(dataR)
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}

function getComments(story_id) {
    var story = {};
    story['story_id'] = story_id;
    $.ajax({
        url: '/get-comments',
        data: story,
        dataType: 'JSON',
        type: 'POST',
        success: function (dataR) {
            $(`.list-group[story-id=${story_id}]`).html('')
            dataR.forEach((item)=>{
                console.log('111',item)
                $(`.list-group[story-id=${story_id}]`).append(`<li style="list-style-type:none">${item.user_name} : ${item.text}</li>`)
            })
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}

function sendAjaxQuery(url, user) {
    $.ajax({
        url: url,
        data: user,
        dataType: 'json',
        type: 'POST',
        success: function (dataR) {
            const result = Object.values({...dataR})

            // catch response data to indexedDB
            $("#results").html('')

            result.forEach((item) => {

                var imgsTempStr = ``
                item.pics.forEach((i) => {
                    var tempStr = '<div class="col-xs-4 col-md-4 col-sm-4 col-lg-4">\n' +
                        `<a href="#" class="thumbnail"><img src="/images/uploads/${i.filename}" alt="pics"></a>` +
                        '</div>'
                    imgsTempStr += tempStr
                })

                let time = formatTime(item.time);

                $("#results").append(`<div class="media" story-id="${item._id}">\n` +
                    '                       <div class="media-left">\n' +
                    '                         <a href="#">\n' +
                    '                           <img class="media-object" src="/images/icons/user.svg" alt="user">\n' +
                    '                     </a>\n' +
                    '                   </div>\n' +
                    `                       <div class="media-body" story-id="${item._id}">\n` +
                    '                         <p class="media-heading">\n' +
                    `                         <p class="user-name">${item.username}</p>\n` +
                    `                         <p class="time">${time}</p></p>\n` +
                    `                         <p id="text">${item.mention}</p>\n` +
                    '                     <div class="row">\n' +
                    imgsTempStr +
                    '                       </div>\n' +
                    '                   <div class="height-30">\n' +
                    '                     <div class="float-right">\n' +
                    `                       <a onclick="addComment('${item._id}')" class="word-button"><span class="glyphicon glyphicon-comment"\n` +
                    `                                                                            aria-hidden="true"></span> comment</a> &nbsp \n` +
                    '                       <a class="word-button"> \n' +
                    '                         <span class="glyphicon glyphicon-star glyphicon-star-empty" onclick="likeRate(this)"\n' +
                    `                                  value="1" story-id="${item._id}"></span>\n` +
                    '                         <span class="glyphicon glyphicon-star glyphicon-star-empty" onclick="likeRate(this)"\n' +
                    `                                  value="2" story-id="${item._id}"></span>\n` +
                    '                         <span class="glyphicon glyphicon-star glyphicon-star-empty" onclick="likeRate(this)"\n' +
                    `                                  value="3" story-id="${item._id}"></span>\n` +
                    '                         <span class="glyphicon glyphicon-star glyphicon-star-empty" onclick="likeRate(this)"\n' +
                    `                                  value="4" story-id="${item._id}"></span>\n` +
                    '                         <span class="glyphicon glyphicon-star glyphicon-star-empty" onclick="likeRate(this)"\n' +
                    `                                  value="5" story-id="${item._id}"></span>\n` +
                    '                       </a>\n' +
                    '                     </div>\n' +
                    '                     </div>\n' +
                    '                     <div>\n' +
                    `                       <ul class="list-group" id="ul1" story-id="${item._id}">\n` +
                    '                       </ul>\n' +
                    '                     </div>\n' +
                    '                   </div>\n' +
                    '                     </div>')

                getComments(item._id)
                getStar(item._id)
                storeCachedData("_id", item, STORE_STORIES)
            });
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
            // get indexedDB cache

            getStoriesInIndexedDB()
        }
    });
}


function formatTime(time) {
    console.log(time);
    return time.replace("T", " ").slice(0,-8);
}

/**
 * change how many star empty, show rate
 * @param starValue
 * @param storyId
 */
function changeStarShow(starValue, storyId) {
    for (var index = 1; index <= 5; index++) {
        if (index <= starValue) {
            $(`span[value=${index}][story-id=${storyId}]`).attr('class', 'glyphicon glyphicon-star')
        } else {
            $(`span[value=${index}][story-id=${storyId}]`).attr('class', 'glyphicon glyphicon-star glyphicon-star-empty')
        }
    }
}

function likeRate(obj) {
    starValue = obj.getAttribute('value');
    storyId = obj.getAttribute('story-id');
    changeStarShow(starValue, storyId)

    var star = {};
    star['story_id'] = storyId;
    star['user_id'] = localStorage.getItem("user_id");
    star['rate'] = starValue;
    $.ajax({
        url: '/update-star',
        data: star,
        dataType: 'JSON',
        type: 'PUT',
        success: function (dataR) {
            console.log(dataR)
        },
        error: function (xhr, status, error) {
            alert('Error: ' + error.message);
        }
    });
}


function getStoriesInIndexedDB() {
    var req = window.indexedDB.open(DB_NAME, 1);
    req.onsuccess = function (ev) {
        console.log("post success");
        var db = ev.target.result;
        var tx = db.transaction([STORE_STORIES], "readonly");
        var store = tx.objectStore(STORE_STORIES);
        var r = store.openCursor();
        var res = [];
        r.onsuccess = function (ev1) {
            var cursor = ev1.target.result;
            if (cursor) {
                res.push(cursor.value);
                cursor.continue()
                console.log(res)
            } else {
                console.log("res of posts", res);
            }
        }
    }
}


/**
 * listen socket to get unread stories count
 * @type {undefined|AudioNode|void}
 */
var socket = io.connect('https://localhost:3000');
socket.on('story-updated', function (count) {
    console.log("story-updated")
    $("#unread-stories").html(count)
})

