Transactions.before.insert (userId, doc) ->
  unless SimpleSchema.RegEx.Id.test(doc.recipient)
    recipient = Meteor.users.findOne({username: doc.recipient}, {fields: _id: 1} )
    if recipient?
      doc.recipient = recipient._id;
