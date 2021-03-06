from unittest import TestCase

from django.conf import settings
import requests


class RapidProSmoke(TestCase):
    def setUp(self):
        self.headers = {'Authorization': "Token %s" % settings.RAPIDPRO_API_TOKEN}

    def test_runs_endpoint_is_up(self):
        response = requests.get(settings.RAPIDPRO_URLS['RUNS'], headers=self.headers)
        self.assertEqual(response.status_code, 200)

    def test_flow_with_id_specified_in_settings_exists(self):
        response = requests.get(settings.RAPIDPRO_URLS['FLOWS'], headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.flow_exists(settings.RAPIDPRO_FLOW_ID, response.json()['results']))

    def flow_exists(self, flow_id, flows):
        matching_flows = filter(lambda flow: flow['flow'] == flow_id, flows)
        return len(matching_flows) == 1

    # TODO Test that flow takes the parameters we provide when RapidPro API makes the @extra.* fields available