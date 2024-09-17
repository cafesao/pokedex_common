export namespace IPokemon {
  export interface IAbout {
    id: number;
    weight: number;
    stats: IStats;
    sprites: ISprites;
    specie: string;
    types: ITypes[];
  }
  export interface IStats {
    hp: number;
    attack: number;
    defense: number;
  }
  export interface ISprites {
    front: string;
    back: string;
  }
  export interface ITypes {
    name: string;
  }
}
