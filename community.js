if (Meteor.isClient) {

  Meteor.subscribe("transactions");

  Template.transactions.onCreated(function(){
    this.subscribe("usernames");
  });

  Template.auth.events({
    "click .logout": function(event, template){
       Meteor.logout();
    }
  });

  Template.transactions.onRendered(function(){
    this.$('.collapsible').collapsible()
  })

  Template.transactions.helpers({
    transactions() {
      return Transactions.find({$or: [{
        'sender._id': Meteor.userId()
      },{
        'recipient': Meteor.userId()
      }]})
    },
    isCredit() {
      return this.recipient === Meteor.userId()
    },
    balance() {
      return _.sum(this, (transaction) => {
        if (transaction.sender._id === Meteor.userId()) {
          return -transaction.sender._id
        }
      })
    },
    recipientUsername() {
      return Meteor.users.findOne(this.recipient).username;
    },
    date(dateString, format) {
      return moment(dateString).format(format);
    }

  });
  // Template.newTransaction.onRendered = function(){
  //   this.$('input.recipient').siblings('label').addClass('active')
  //   this.$('input.recipient').focus()
  // }
  Template.newTransaction.events({
    "focus input.recipient, blur input.recipient": function(event, template){
      if (event.type === 'focusout' || !!event.target.value) {return;}
      $(event.target).parent().siblings('label').toggleClass('active')
    }
  });
  Template.newTransaction.helpers({
    // usernames: function() {
    //   return Meteor.users.find().fetch().map(function(it){ return it.username; });
    // }
    doc: function() {
      return {
        // sender: {
        //   _id: user._id,
        //   username: user.username,
        //   avatar: ''
        // },
        dateSent: new Date()
      }
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Meteor.users.find().count() === 0 ) {
      var userObject = {
        username: "dummy",
        mail: "sean@maplekiwi.com",
        password: Meteor.settings.password
      };

      Accounts.createUser(userObject, function(){
        console.log('dummy account created');
      });
    }
  });

  Accounts.onCreateUser(function(options, user){
    username = user.services.facebook.name;
    user.username=generate_username(username);
    user.profile = {};
    user.profile.name = username;
    user.profile.un = username;

    function generate_username (username) {
      var count;
      username = username.toLowerCase().trim().replace(" ", "");
      count = Meteor.users.find({"profile.un": username}).count();
      if (count === 0) {
        return username;
      }
      else {
        return username + (count + 1).toString();
      }
    }

    return user
  });

  Meteor.publish("transactions", function() {
    let user = this.userId;
    let query = {$or: [{
      'sender._id': user
    },{
      'recipient': user
    }]};
    Counts.publish(this, 'balance', Transactions.find(query, {
      fields: {amount:1, 'sender._id':1}
    }), {
      noReady: true,
      countFromField: function(doc) {
        if (doc.sender._id === user) {
          return -doc.amount
        } else return doc.amount
      }
    });
    return Transactions.find(query);
  });

  Meteor.publish("usernames", function(){

    return Meteor.users.find({}, {fields: {username:1, "services.facebook.id":1} })

  });
}
