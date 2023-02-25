const userId = "me"; // use "me" to specify the current user

function labelEmails() {
  const maxResults = 500;
  var threadsResponse = Gmail.Users.Threads.list(
    userId,
    {
      maxResults: maxResults
    }
  );

  const size = threadsResponse.resultSizeEstimate;
  const numPages = Math.ceil(size / maxResults);
  var nextPageToken = threadsResponse.nextPageToken;
  var threads = threadsResponse.threads;
  var seenSendersSet = new Set();

  for (var requests = 0; requests < numPages; requests++) {
    for (var thread of threads) {
      thread = Gmail.Users.Threads.get(userId, thread.id);
      var messages = thread.messages;

      if(messages.length > 0) {
        var to = messages[0].payload.headers.find(element => element.name == "To").value;
        var senderMatch = to.match(/\+(.*?)@/);
        if (senderMatch != null) {
          var sender = senderMatch[1];
          Logger.log(`Checking against ${sender.toLowerCase()}`)
          if(!seenSendersSet.has(sender.toLowerCase())) {
            sender = sender.charAt(0).toUpperCase() + sender.slice(1);
            var label = getOrCreateLabel(sender);
            createLabelFilter(label, to);
            var labels = getParentLabels(label);
            labels.push(label.id);
            Gmail.Users.Threads.modify(
              { addLabelIds: labels },
              userId,
              thread.id
            )
            seenSendersSet.add(sender.toLowerCase());
            Logger.log(`Added ${sender.toLowerCase()}`);
          }
        }
      }
    }
    if(nextPageToken) {
        threadsResponse = Gmail.Users.Threads.list(userId, { maxResults: maxResults, nextPageToken: nextPageToken }).threads;
        nextPageToken = threadsResponse.nextPageToken;
        threads = threadsResponse.threads;
    }
  }
  Logger.log("Done!");
}

function getOrCreateLabel(name) {
  var labels = Gmail.Users.Labels.list(userId).labels;
  var newLabelName = name.replace(/\s+/g, '').toLowerCase();
  Logger.log("Name: " + name);
  if(newLabelName.indexOf("/") != -1) {
    newLabelName = newLabelName.substring(newLabelName.lastIndexOf("/") + 1)
  }
  for(var currentLabel of labels) {
    var currentLabelName = currentLabel.name.replace(/\s+/g, '').toLowerCase();
    //Logger.log("Testing label: " + currentLabelName);
    if(currentLabelName.indexOf("/") != -1) {
      currentLabelName = currentLabelName.substring(currentLabelName.lastIndexOf("/") + 1)
    }
    if(currentLabel.type != "system" && currentLabelName == newLabelName) {
      Logger.log("Label already exists " + currentLabel.name);
      return currentLabel;
    }
  }
  Logger.log("Creating new label: " + name);

  var label = Gmail.Users.Labels.create({name: name}, userId);
  Logger.log("New label created with ID: " + label.id);
  return label;
}

function getParentLabels(label) {
  var parentLabels = [];
  var labelName = label.getName();
  while (labelName.indexOf("/") != -1) {
    labelName = labelName.substring(0, labelName.lastIndexOf("/"));
    parentLabels.push(getOrCreateLabel(labelName).id);
  }
  return parentLabels;
}

function createLabelFilter(label, to) {
  var filters = Gmail.Users.Settings.Filters.list(userId);
  if(filters) {
    for(var currentFilter of filters) {
      var currentFilterTo = currentFilter.criteria.to;
      var currentFilterLabelId = currentFilter.action.addLabelIds;
      Logger.log("current filter to: " + currentFilterFrom);
      if(currentFilterTo == to && currentFilterLabelId == label.id) {
        return;
      }
    }
  var filter = Gmail.Users.Settings.Filters.create(
    {
      criteria: {
        to: to
      },
      action: {
        addLabelIds: [label.id]
      }
    },
    userId
  );
  Gmail.Users.Settings.Filters.create(filter, userId);
  }
}