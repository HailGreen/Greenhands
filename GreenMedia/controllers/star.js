let Star = require('../models/star');

/**
 * Rate the story set by the user
 * @param req
 * @param res
 */
exports.insert = function (req, res) {
    // user_id, story_id, rate
    let user_id = req.body.user_id;
    let story_id = req.body.story_id;
    let rate = req.body.rate;
    try {
        // The structure of the star
        let star = new Star({
            user_id: user_id,
            story_id: story_id,
            rate: rate
        });
        star.save(function (err, results) {
            if (err)
                res.status(500).send('Cannot rate the story!');
            res.setHeader('Content-Type', 'application/json');
            res.send({"code": 0, "msg": "success"});
        });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
};

/**
 * Update the star.
 * @param req
 * @param res
 */
exports.updateStar = function (req, res) {
    // user_id, story_id, rate
    let user_id = req.body.user_id;
    let story_id = req.body.story_id;
    let rate = req.body.rate;
    try {
        Star.update({user_id: user_id, story_id: story_id}, {rate: rate}, {upsert: true},
            function (err, star) {
                if (err)
                    res.status(500).send('Cannot update the rate of this story!');
                res.setHeader('Content-Type', 'application/json');
                res.send({"code": 0, "msg": "success"});
            })
    } catch (e) {
        res.status(500).send('error ' + e);
    }
};

/**
 * Get the star according to the user_id and the story_id;
 * @param req
 * @param res
 */
exports.getStar = function (req, res) {
    // user_id, story_id
    let user_id = req.body.user_id;
    let story_id = req.body.story_id;
    try {
        Star.find({user_id: user_id, story_id: story_id},
            function (err, star) {
                if (err)
                    res.status(500).send('Cannot obtain the rate!');
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(star));
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
};

/**
 * Get stars of stories which are from one user;
 * @param req
 * @param res
 */
exports.getStoryStars = function (req, res) {
    let story_id = JSON.parse(req.body.story_id);
    try {
        let story_rate_count = {};
        // Initialize the story rate.
        story_id.forEach((item) => {
            story_rate_count[item] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        });
        Star.find({story_id},
            function (err, stars) {
                if (err)
                    res.status(500).send('Cannot get stars of this story!');
                // Count the story rate
                stars.forEach((item) => {
                    story_rate_count[item.story_id][item.rate] ++;
                });
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(story_rate_count));
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
};

/**
 * Get all the stars
 * @param req
 * @param res
 */
exports.getStars = function (req, res) {
    try {
        Star.find(
            function (err, stars) {
                if (err)
                    res.status(500).send('Cannot obtain the stars');
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(stars));
            });
    } catch (e) {
        res.status(500).send('error ' + e);
    }
};
