schema = new SimpleSchema
  sender:
    type: Object
    autoform:
      omit: true
  'sender._id':
    type: String
    regEx: SimpleSchema.RegEx.Id
    index: 1
    autoValue: -> Meteor.userId()
  'sender.username': type: String, index: 1, autoValue: -> Meteor.user().username
  # 'sender.avatar': type: String, optional: true, autoValue: -> Meteor.user().profile.avatar

  recipient:
    type: String
    index: 1
    custom: ->
      unless SimpleSchema.RegEx.Id.test(@value)
        return 'unrecognizedUser'

      sender = @field 'sender._id'
      if sender.value == @value
        return 'recipientError'
      else
        return yes

    autoform:
      type: "typeahead"
      class: "recipient"
      options: ->
        Meteor.users.find().fetch().map (it) -> {label: it._id, value: it.username}
      typeaheadOptions:
        highlight: true

  amount:
    type: Number
    min: 1
  dateSent:
    label: "Send transaction on:"
    defaultValue: new Date()
    type: Date
    autoform:
      # type:"pickadate"
      omit: true
  # particulars:
  #   type: String
  #   max: 12
  #   optional: true
  # code:
  #   type: String
  #   max: 12
  #   optional: true
  # reference:
  #   type: String
  #   max: 12
  #   optional: true
  description:
    label: 'Reference Info'
    type: String
    max: 149
    optional: true
    autoform: type: 'textarea', class: 'character-count', length: 149

schema.messages
  'recipientError':'[401] Sorry you cannot have yourself as a recipient.'
  'unrecognizedUser': "[404] Sorry we can't find that recipient."

Transactions.attachSchema schema
