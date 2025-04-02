const favoritesTranslations = {
  en: {
    // ... existing translations
    favorites: "Favorites",
    noFavorites: "You don't have any favorite Pokémon yet.",
    browsePokemon: "Browse Pokémon",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    addedToFavorites: "Added to favorites",
    removedFromFavorites: "Removed from favorites",
    teams: "Teams",
    myTeams: "My Teams",
    createTeam: "Create Team",
    editTeam: "Edit Team",
    deleteTeam: "Delete Team",
    teamName: "Team Name",
    teamDescription: "Team Description",
    noTeams: "You don't have any teams yet.",
    createYourFirstTeam: "Create your first team",
    addPokemon: "Add Pokémon",
    removePokemon: "Remove Pokémon",
    nickname: "Nickname",
    position: "Position",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this team?",
    teamDeleted: "Team deleted successfully",
    teamCreated: "Team created successfully",
    teamUpdated: "Team updated successfully",
    pokemonAdded: "Pokémon added to team",
    pokemonRemoved: "Pokémon removed from team",
  },
  pt: {
    // ... existing translations
    favorites: "Favoritos",
    noFavorites: "Você ainda não tem nenhum Pokémon favorito.",
    browsePokemon: "Explorar Pokémon",
    addToFavorites: "Adicionar aos Favoritos",
    removeFromFavorites: "Remover dos Favoritos",
    addedToFavorites: "Adicionado aos favoritos",
    removedFromFavorites: "Removido dos favoritos",
    teams: "Times",
    myTeams: "Meus Times",
    createTeam: "Criar Time",
    editTeam: "Editar Time",
    deleteTeam: "Excluir Time",
    teamName: "Nome do Time",
    teamDescription: "Descrição do Time",
    noTeams: "Você ainda não tem nenhum time.",
    createYourFirstTeam: "Crie seu primeiro time",
    addPokemon: "Adicionar Pokémon",
    removePokemon: "Remover Pokémon",
    nickname: "Apelido",
    position: "Posição",
    save: "Salvar",
    cancel: "Cancelar",
    confirmDelete: "Tem certeza que deseja excluir este time?",
    teamDeleted: "Time excluído com sucesso",
    teamCreated: "Time criado com sucesso",
    teamUpdated: "Time atualizado com sucesso",
    pokemonAdded: "Pokémon adicionado ao time",
    pokemonRemoved: "Pokémon removido do time",
  },
}

const existingTranslations = {
  en: {},
  pt: {},
}

// Merge these translations with your existing ones
export const translations = {
  en: {
    ...existingTranslations.en,
    ...favoritesTranslations.en,
  },
  pt: {
    ...existingTranslations.pt,
    ...favoritesTranslations.pt,
  },
}

