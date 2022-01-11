<script>
// TODO this is just the HTML copied in - functions/CSS are still to be migrated
import {mapState, mapGetters} from "vuex";
import LegendMenu from "./modules/legend/components/LegendMenu.vue";
import PortalTitle from "./modules/portalTitle/components/PortalTitle.vue";
import SearchBar from "./modules/searchBar/components/SearchBar.vue";

export default {
    name: "MainNav",
    components: {
        LegendMenu,
        PortalTitle,
        SearchBar
    },
    computed: {
        ...mapState([
            // listen to configJson changes for mounting the tools
            "configJson"
        ]),
        ...mapGetters([
            "legendConfig",
            "searchBarConfig"
        ])
    }
};
</script>

<template>
    <header>
        <nav
            id="main-nav"
            class="navbar navbar-default"
            role="navigation"
        >
            <div class="container-fluid">
                <div id="navbarRow">
                    <div class="navbar-header">
                        <button
                            type="button"
                            class="navbar-toggle"
                            data-toggle="collapse"
                            data-target=".navbar-collapse"
                        >
                            <span class="sr-only">Navigation ein-/ausblenden</span>
                            <span class="icon-bar" />
                            <span class="icon-bar" />
                            <span class="icon-bar" />
                        </button>
                    </div>
                    <div class="collapse navbar-collapse">
                        <ul
                            id="root"
                            class="nav-menu"
                        />
                        <!-- The param "dev" is only used for development of the search bar vue-version -->
                        <!-- Will be removed again after finalization of the search bar -->
                        <ul
                            v-if="searchBarConfig && searchBarConfig.dev === true"
                            class="navbar-form navbar-right"
                        >
                            <SearchBar v-if="searchBarConfig" />
                        </ul>
                    </div>
                    <LegendMenu v-if="legendConfig" />
                    <PortalTitle />
                </div>
            </div>
        </nav>
    </header>
</template>

<style lang="scss" scoped>
    #main-nav{
        flex-grow:0;
    }
</style>
