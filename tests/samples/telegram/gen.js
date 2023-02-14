const fs = require("fs");
const { faker } = require("@faker-js/faker");

const N_YEARS = 3;
const N_AUTHORS = 20;
const N_MESSAGES = N_YEARS * 365 * 5;

const sample = {
    name: "Big sample",
    type: "private_supergroup",
    id: 1111111111,
    messages: [],
};

faker.seed(42);
const authors = new Array(N_AUTHORS).fill(0).map(() => faker.internet.userName());

for (let i = 0; i < N_MESSAGES; i++) {
    faker.seed(i);

    const author = faker.helpers.arrayElement(authors);
    const message = {
        type: "message",
        date: faker.date.past(N_YEARS, "2020-01-01T00:00:00.000Z"),
        from: author,
        from_id: authors.indexOf(author),
        text: faker.lorem.sentence(),
    };
    sample.messages.push(message);
}

// sort messages
sample.messages = sample.messages.sort((a, b) => a.date - b.date);

// convert dates to strings
sample.messages = sample.messages.map((message, i) => ({ id: i + 1, date: message.date.toISOString(), ...message }));

fs.writeFileSync(`./BIG_${authors.length}A_${sample.messages.length}M.json`, JSON.stringify(sample, null, 4) + "\n");
