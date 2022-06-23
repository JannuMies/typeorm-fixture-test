import { FixtureLoader } from "./FixtureLoader";
import { MysqlCacheFixture } from "./cache/MysqlCacheFixture";
import { PostgresCacheFixture } from "./cache/PostgresCacheFixture";
import { getConnection } from "typeorm";
import { SqliteCacheFixture } from "./cache/SqliteCacheFixture";
import * as fs from "fs-extra";
import * as fg from 'fast-glob'
import * as appRoot from "app-root-path";

const loadFixturesHelper = async (fixturesPath?: string): Promise<void> => {
  if (!fixturesPath) {
    const fileContent = await fs.readFile(appRoot + "/fixture.config.json");
    const fixtureConfig = JSON.parse(fileContent.toString());
    fixturesPath = fixtureConfig.path as string;
  }
  return loadFixturePaths([fixturesPath])
};

const loadFixtureGlob = async (glob: string) => {
    const fixtures = await fg(glob)
    return loadFixturePaths(fixtures)
}

const loadFixturePaths = async (fixturesPaths: string[]): Promise<void> => {
  const fixtureLoader = new FixtureLoader();
  const databaseType = getConnection().options.type;

  switch (databaseType) {
    case "mysql":
    case "mariadb":
      return fixtureLoader.loadFixtures(new MysqlCacheFixture(), fixturesPaths);
    case "postgres":
      return fixtureLoader.loadFixtures(
        new PostgresCacheFixture(),
        fixturesPaths
      );
    case "sqlite":
      return fixtureLoader.loadFixtures(new SqliteCacheFixture(), fixturesPaths);
    default:
      throw "Invalid database type. type must be mysql, mariadb, postgres or sqlite";
  }
};

export default loadFixturesHelper;
export {loadFixtureGlob}
