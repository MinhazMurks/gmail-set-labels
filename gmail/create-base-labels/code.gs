function createBaseLabels() {
  const labelNames = [
    "Art",
    "Computers",
    "Entertainment",
    "Entertainment/Shows",
    "Entertainment/Videos",
    "Entertainment/Video Games",
    "Entertainment/Video Games/Mods",
    "Finances",
    "Food",
    "Learning",
    "Programming",
    "Security",
    "Services",
    "Social Media",
    "Shopping",
    "Utilities",
  ]


  createLabels(labelNames);
}

function createLabels(labelNamesList) {
  const userId = 'me';

  for(var labelName of labelNamesList) {
    try {
      Gmail.Users.Labels.create({ name: labelName }, userId );
    }
    catch(e) {
      Logger.log("Got error: " + e.message);
    }
  }
}