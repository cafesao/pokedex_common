import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { IPokemon } from "./interface/pokemon";
import { v4 as uuid } from "uuid";
import normalizeValue from "./helper/normalizeValue";
import { Label } from "./components/ui/label";

export default function Component() {
  const [pokemonName, setPokemonName] = useState("");
  const [pokemon, setPokemon] = useState<IPokemon.IAbout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchPokemon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemonName) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`,
      );
      if (!response.ok) throw new Error("Pokémon não encontrado");
      const data = await response.json();

      const stats: IPokemon.IStats = {
        hp: 0,
        attack: 0,
        defense: 0,
      };
      for (const state of data.stats) {
        if (state.stat.name in stats) {
          stats[state.stat.name as keyof IPokemon.IStats] = state.base_stat;
        }
      }
      const types: IPokemon.ITypes[] = [];
      for (const type of data.types) {
        types.push({
          name: type.type.name,
        });
      }
      setPokemon({
        id: data.id,
        weight: data.weight,
        specie: data.species.name,
        sprites: {
          front: data.sprites.front_default || "",
          back: data.sprites.back_default || "",
        },
        stats,
        types,
      });
    } catch (err) {
      setError("Pokémon não encontrado. Tente novamente.");
      setPokemon(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(pokemon);
  }, [pokemon]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={searchPokemon} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Digite o nome do Pokémon"
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Buscando..." : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {pokemon && (
        <Card className="overflow-hidden transition-all duration-300 ease-in-out transform hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="text-2xl capitalize text-center">
              {pokemon.specie}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-background">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div className="flex gap-4 mb-4 sm:mb-0">
                <img
                  src={pokemon.sprites.front}
                  alt={`${pokemon.specie} front`}
                  className="w-24 h-24 object-contain"
                />
                <img
                  src={pokemon.sprites.back}
                  alt={`${pokemon.specie} back`}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">#{pokemon.id}</p>
                <p className="text-gray-600">Peso: {pokemon.weight / 10} kg</p>
                <div className="flex gap-2 mt-2">
                  {pokemon.types.map((type) => (
                    <span
                      key={uuid()}
                      className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800"
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="hp"
                  className="text-sm font-medium text-gray-600"
                >
                  HP
                </Label>
                <input type="hidden" id="hp" />
                <Progress
                  value={normalizeValue(pokemon.stats.hp)}
                  className="h-2"
                />
                <span className="text-xs text-gray-500">
                  {pokemon.stats.hp}/255
                </span>
              </div>
              <div>
                <Label
                  htmlFor="ataque"
                  className="text-sm font-medium text-gray-600"
                >
                  Ataque
                </Label>
                <input type="hidden" id="ataque" />
                <Progress
                  value={normalizeValue(pokemon.stats.attack)}
                  className="h-2"
                />
                <span className="text-xs text-gray-500">
                  {pokemon.stats.attack}/255
                </span>
              </div>
              <div>
                <Label
                  htmlFor="defesa"
                  className="text-sm font-medium text-gray-600"
                >
                  Defesa
                </Label>
                <input type="hidden" id="defesa" />
                <Progress
                  value={normalizeValue(pokemon.stats.defense)}
                  className="h-2"
                />
                <span className="text-xs text-gray-500">
                  {pokemon.stats.defense}/255
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
