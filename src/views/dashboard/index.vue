<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import adminDashboard from "./admin";
import userDashboard from "./user";

export default {
  name: 'Dashboard',
  components: { adminDashboard, userDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    const roleValues = this.roles.map(role => role.value)
    if (!roleValues.includes('SUPERADMIN')) {
      this.currentRole = 'userDashboard'
    }
  }
}
</script>
