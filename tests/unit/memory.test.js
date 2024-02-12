// Fix this path to point to your project's `memory-db.js` source file
const Memory = require('../../src/model/data/memory/index.js');

describe('memory', () => {
  let fragment = {
    ownerId: "a",
    id: "abc",
    fragment: "test"
  }

  test('readFragment() returns what we write into the db using writeFragment()', async () => {
    await Memory.writeFragment(fragment);
    const result = await Memory.readFragment('a', 'abc');
    expect(result).toEqual(fragment);
  });

  test('readFragmentData() and readFragmentData() work with Buffers', async () => {
    const data = Buffer.from([1, 2, 3]);
    await Memory.writeFragmentData("a", "abc", data);
    const result = await Memory.readFragmentData("a", "abc");
    expect(result).toEqual(data);
  });

  test('readFragmentData() and readFragmentData() work with Buffers', async () => {
    const data = Buffer.from([1, 2, 3]);
    await Memory.writeFragmentData("a", "abc", data);
    const result = await Memory.readFragmentData("a", "abc");
    expect(result).toEqual(data);
  });

  test('listFragments() returns all the ids for the owner', async () => {
    await Memory.writeFragment({ ownerId: "a", id: "a", fragment: 1 });
    await Memory.writeFragment({ ownerId: "a", id: "ab", fragment: 2 });
    await Memory.writeFragment({ ownerId: "a", id: "abc", fragment: 3 });
    const id = ["a", "ab", "abc"];

    const results = await Memory.listFragments('a');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual(expect.arrayContaining(id));
  });

  test('listFragments() with expanded=true returns all the fragments for the owner', async () => {
    await Memory.writeFragment({ ownerId: "a", id: "a", fragment: 1 });
    await Memory.writeFragment({ ownerId: "a", id: "ab", fragment: 2 });
    await Memory.writeFragment({ ownerId: "a", id: "abc", fragment: 3 });
    const id = [{ ownerId: "a", id: "a", fragment: 1 }, { ownerId: "a", id: "ab", fragment: 2 }, { ownerId: "a", id: "abc", fragment: 3 }];

    const results = await Memory.listFragments('a', true);
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual(expect.arrayContaining(id));
  });

  test('deleteFragment delete the fragment of the specified id of the specified owner', async () => {
    await Memory.writeFragment(fragment);
    await Memory.deleteFragment("a", "abc");
    expect(await Memory.readFragment('a', 'abc')).toBe(undefined);
  });

});
