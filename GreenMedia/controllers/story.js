let Story = require('../models/story');
let Star = require('../models/star');
let Ranking = require('../CollectiveIntelligence/Ranking');

/**
 * Insert one story;
 * @param req
 * @param res
 */
exports.insertStory = function (req, res) {
    // story text;
    let mention = req.body.mention;
    // story pictures;
    let pics = req.files;
    // userId
    let id = req.body.id;
    let username = req.body.username;
    let story_id = req.body.story_id;
    try {
        let story = new Story({
            story_id: story_id,
            user_id: id,
            username: username,
            mention: mention,
            pics: pics,
            time: new Date(),
        });

        story.save(function (err) {

            if (err)
                res.status(500).send('Invalid data!');

            res.setHeader('Content-Type', 'application/json');
            res.send({"code": 0, "msg": "success"});

        });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}

exports.getUserStories = function (req, res) {
    let user_id = req.body.user_id;
    try {
        Story.find({user_id: user_id},
            function (err, stories) {
                if (err)
                    res.status(500).send('Invalid data!');
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(stories));
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}

exports.getStories = function (req, res) {
    let user_id = req.body.user_id;
    let story_number = req.body.story_number;
    let sort_method = req.body.sort_method;
    if (sort_method.indexOf('Pearson') > -1){
        sort_method = 'sim_pearson';
    } else if (sort_method.indexOf('Euclidean') > -1){
        sort_method = 'sim_euclidean'
    } else {
        sort_method = 'timeline';
    }
    try {
        if (sort_method === 'timeline') {
            Story.countDocuments(function (err, count) {
                if (!err) {
                    let query = Story.find().skip(count - Number (story_number) - 10).limit(10);
                    query.exec(function(err,stories){
                        if(err){
                            res.send(err);
                        }else{
                            stories.reverse();
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(stories));
                        }
                    });
                }
            });
        } else {
            Story.find(function (err, stories) {
                Star.find(function (err, stars) {
                    // Obtain the values of users.
                    // The structure of users is: {["user_id"]:[{"story_id": rate}]}
                    let users = {};
                    stars.forEach(item => {
                        if (!users[item.user_id]) {
                            users[item.user_id] = [];
                        }
                        let story = item.story_id;
                        let rate = item.rate;
                        let object = {};
                        object[story] = rate;
                        users[item.user_id].push(object);
                    });
                    // Get the recommendations according to the user_id and users through sim_pearson
                    let ranking = new Ranking();
                    let results = ranking.getRecommendations(users, user_id, sort_method);
                    let recommendIdArray = [];
                    let result = [];
                    let ratedResult = [];
                    results.forEach((item, index) => {
                        recommendIdArray[index] = item.story;
                    });
                    stories.forEach((item, index) => {
                        let rank_index = recommendIdArray.indexOf(item.story_id);
                        if (rank_index > -1) {
                            result[rank_index] = item
                        } else {
                            ratedResult.push(item)
                        }
                    });
                    result = result.concat(ratedResult);
                    result = result.slice(Number (story_number), Number (story_number) + 10);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(result));
                })
            })
        }
    } catch (e) {
        res.status(500).send('error ' + e);
    }
}
