if (Meteor.isClient) {

  Meteor.subscribe("transactions");

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
  Template.newTransaction.onRendered = function(){
    this.$('input.recipient').siblings('label').addClass('active')
    this.$('input.recipient').focus()
  }
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
    // code to run on server at startup
    // console.log("does the Transactions variable exist as a mongo collection?");
    // console.log("insert" in Transactions);
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

    return Meteor.users.find({}, {fields: {username:1} })

  });
}
