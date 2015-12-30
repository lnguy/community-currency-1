Transactions.before.insert (userId, doc) ->
  unless SimpleSchema.RegEx.Id.test(doc.recipient)
    console.log('username is not an id')
    doc.recipient = Meteor.users.findOne({username: doc.recipient}, {fields: _id: 1} )._id
    console.log doc.recipient
    return
