print("===============JAVASCRIPT===============");
print("Count of rows in test collection: " + db.notes.count());

db.notes.insert({
  createdBy: "1",
  content: "Testing note #1",
  deleted: false,
  createdAt: "2021-03-12T06:30:05.665Z",
  updatedAt: "",
});
db.notes.insert({
  createdBy: "1",
  content: "Testing note #2",
  deleted: false,
  createdAt: "2021-03-12T06:30:05.712Z",
  updatedAt: "",
});
db.notes.insert({
  createdBy: "1",
  content: "Testing note #3",
  deleted: true,
  createdAt: "2021-03-12T06:30:05.777Z",
  updatedAt: "",
});
db.notes.insert({
  createdBy: "1",
  content: "Testing note #4",
  deleted: false,
  createdAt: "2021-03-12T06:30:05.820Z",
  updatedAt: "",
});
db.notes.insert({
  createdBy: "1",
  content: "Testing note #5",
  deleted: true,
  createdAt: "2021-03-12T06:30:05.856Z",
  updatedAt: "",
});

print("===============AFTER JS INSERT===============");
print("Count of rows in test collection: " + db.notes.count());

allRecords = db.notes.find();
while (allRecords.hasNext()) {
  printjson(allRecords.next());
}
