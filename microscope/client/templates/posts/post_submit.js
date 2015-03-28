Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault();//formのsubmit処理無効化

    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    Meteor.call('postInsert', post, function(error, result) {
      // display the error to the user and abort
      if (error)
        return alert(error.reason);
    });
    Router.go('postsList');
  }
});
