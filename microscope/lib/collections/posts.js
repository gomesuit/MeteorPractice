Posts = new Meteor.Collection('posts');


Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });

    if (Meteor.isServer) {
      postAttributes.title += "(server)";
      // wait for 5 seconds
      Meteor._sleepForMs(5000);
    } else {
      postAttributes.title += "(client)";
    }

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
       console.log("exist postWithSameLink");
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0
    });
    var postId = Posts.insert(post);
    return {
      _id: postId
    };
  },

  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);

    var affected = Posts.update({
      _id: postId,
      upvoters: {$ne: this.userId}
    }, {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });
    if (! affected)
      throw new Meteor.Error('invalid', "You weren't able to upvote that post");
  }

});

Posts.allow({
  update: function(userId, doc) { return doc && doc.userId === userId; },
  remove: function(userId, doc) { return doc && doc.userId === userId; },
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    //undescore.jsの機能 url,title以外のフィールドが存在したらtrueが
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0); 
  }
});

