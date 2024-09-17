import { useEffect, useState } from "react";
import { PokemonClient } from "pokenode-ts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import type { IPokemon } from "./interface/pokemon";

export default function App() {
  const [input, setInput] = useState<string>("pikachu");
  const [pokemon, setPokemon] = useState<IPokemon.IAbout>();
  const client = new PokemonClient();

  // biome-ignore lint/correctness/useExhaustiveDependencies(client.getPokemonByName): <Not verify client>
  useEffect(() => {
    async function getPokemon() {
      if (input) {
        const result = await client.getPokemonByName(input);
        const stats: IPokemon.IStats = {
          hp: 0,
          attack: 0,
          defense: 0,
        };
        for (const state of result.stats) {
          if (state.stat.name in stats) {
            stats[state.stat.name as keyof IPokemon.IStats] = state.base_stat;
          }
        }
        const types: IPokemon.ITypes[] = [];
        for (const type of result.types) {
          types.push({
            name: type.type.name,
          });
        }
        setPokemon({
          id: result.id,
          weight: result.weight,
          specie: result.species.name,
          sprites: {
            front: result.sprites.front_default || "",
            back: result.sprites.back_default || "",
          },
          stats,
          types,
        });
      }
    }
    getPokemon();
  }, [input]);

  useEffect(() => {
    console.log(pokemon);
  }, [pokemon]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-500 to-emerald-600">
      <div className="flex flex-row justify-center items-center pt-6">
        <h1 className="text-3xl font-bold text-gray-700 text-center">
          Pokedex Common
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center pt-10">
        <Card>
          <CardHeader>
            <CardTitle>About Pokemon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>CardContent</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
