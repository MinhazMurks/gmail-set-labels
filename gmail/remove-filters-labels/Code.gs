function deleteAllLabelsAndFilters() {
  const userId = 'me';

  var labelResponse = Gmail.Users.Labels.list(userId);
  if(labelResponse && labelResponse.labels) {
    for(const label of labelResponse.labels) {
      if(label.type != "system") {
        Gmail.Users.Labels.remove(userId, label.id);
      }
    }
  }
  
  var filterResponse = Gmail.Users.Settings.Filters.list(userId);
  if(filterResponse && filterResponse.filter) {
    for (const filter of filters) {
      Gmail.Users.Settings.Filters.remove(userId, filter.id);
    }
  }
}
